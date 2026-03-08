import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiJobService } from '../ai-jobs/ai-job.service';
import { FraudAlertEntity } from '../entities/fraud-alert/fraud-alert.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { ClaimantEntity } from '../entities/claimant/claimant.entity';

const FRAUD_SCHEMA = {
  risk_level: 'low|medium|high|critical',
  confidence: '<number 0-1>',
  flags: [{ type: '<string>', description: '<string>', severity: 'low|medium|high|critical' }],
  explanation: '<string>',
};

@Injectable()
export class FraudAnalysisService {
  constructor(
    private readonly aiJobService: AiJobService,
    @InjectRepository(FraudAlertEntity)
    private readonly fraudAlertRepo: Repository<FraudAlertEntity>,
  ) {}

  async analyze(
    submission: IntakeSubmissionEntity,
    claimant: ClaimantEntity,
    isRepeat: boolean,
  ): Promise<void> {
    const rawPayload = (submission.raw_payload ?? {}) as Record<string, unknown>;
    const repeatLabel = isRepeat ? `Yes (prior submission exists)` : `No, first submission`;

    const prompt = `You are a legal intake fraud detection system for a mass tort litigation firm.

Analyze this claimant submission for fraud indicators:

Claimant name: ${claimant.full_name}
Intake channel: ${submission.intake_channel ?? 'unknown'}
Repeat submission: ${repeatLabel}
Injury description: ${(rawPayload.injury_description as string) ?? 'not provided'}
Injury date: ${(rawPayload.injury_date as string) ?? 'not provided'}
Campaign: ${submission.tort_campaign_id ?? 'none'}
Additional details: ${JSON.stringify(rawPayload)}

Look for: inconsistencies, implausible dates/descriptions, missing details, suspicious patterns, channel mismatches.`;

    const { result } = await this.aiJobService.run({
      analysisType: 'fraud_detection',
      entityType: 'intake_submission',
      entityId: submission.id,
      prompt,
      triggeredBy: 'system',
      schema: FRAUD_SCHEMA,
    });

    const parsed = result as {
      risk_level?: string;
      confidence?: number;
      flags?: Array<{ type: string; description: string; severity: string }>;
      explanation?: string;
    };

    const flags = parsed.flags ?? [];
    for (const flag of flags) {
      const alert = this.fraudAlertRepo.create({
        intake_submission_id: submission.id,
        alert_type: flag.type,
        description: flag.description,
        severity: flag.severity,
        ai_confidence: parsed.confidence,
        detection_method: 'ai_detection',
        status: 'open',
        evidence: parsed.explanation,
      });
      await this.fraudAlertRepo.save(alert);
    }
  }
}
