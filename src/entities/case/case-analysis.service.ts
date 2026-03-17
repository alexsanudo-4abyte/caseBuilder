import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseEntity } from './case.entity';
import { IntakeSubmissionEntity } from '../intake-submission/intake-submission.entity';
import { TortCampaignEntity } from '../tort-campaign/tort-campaign.entity';
import { IntegrationsService } from '../../integrations/integrations.service';

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    case_strength_score:   { type: 'number' },
    credibility_score:     { type: 'number' },
    settlement_probability:{ type: 'number' },
    fraud_score:           { type: 'number' },
    ai_risk_factors:       { type: 'array', items: { type: 'string' } },
    ai_strength_factors:   { type: 'array', items: { type: 'string' } },
    ai_case_summary:       { type: 'string' },
  },
};

@Injectable()
export class CaseAnalysisService {
  constructor(
    @InjectRepository(CaseEntity)
    private readonly caseRepo: Repository<CaseEntity>,
    @InjectRepository(IntakeSubmissionEntity)
    private readonly submissionRepo: Repository<IntakeSubmissionEntity>,
    @InjectRepository(TortCampaignEntity)
    private readonly campaignRepo: Repository<TortCampaignEntity>,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async analyze(caseId: string): Promise<CaseEntity> {
    const caseEntity = await this.caseRepo.findOne({ where: { id: caseId } });
    if (!caseEntity) throw new Error('Case not found');

    // Load intake submission data
    let intakePayload: Record<string, unknown> = {};
    let aiChatSummary = '';
    let keyFacts: string[] = [];
    let qualificationScore: number | null = null;
    let conversation: Array<{ role: string; content: string }> = [];

    if (caseEntity.intake_submission_id) {
      const submission = await this.submissionRepo.findOne({
        where: { id: caseEntity.intake_submission_id },
      });
      if (submission) {
        intakePayload = (submission.raw_payload ?? {}) as Record<string, unknown>;
        aiChatSummary = submission.ai_chat_summary ?? '';
        keyFacts = submission.key_facts ?? [];
        qualificationScore = submission.qualification_score ?? null;
        conversation = (intakePayload.conversation ?? []) as Array<{
          role: string;
          content: string;
        }>;
      }
    }

    // Load campaign context
    const campaignLines: string[] = [];
    if (caseEntity.tort_campaign_id) {
      const campaign = await this.campaignRepo.findOne({
        where: { id: caseEntity.tort_campaign_id },
      });
      if (campaign) {
        campaignLines.push(`Campaign: ${campaign.name}`);
        if (campaign.qualifying_criteria)
          campaignLines.push(`Qualifying criteria: ${campaign.qualifying_criteria}`);
        if (campaign.statute_of_limitations_info)
          campaignLines.push(`Statute of limitations: ${campaign.statute_of_limitations_info}`);
        if (campaign.defendants?.length)
          campaignLines.push(`Defendants: ${campaign.defendants.join(', ')}`);
        if (campaign.estimated_avg_settlement)
          campaignLines.push(
            `Estimated avg settlement: $${campaign.estimated_avg_settlement.toLocaleString()}`,
          );
      }
    }

    const transcriptText = conversation.length
      ? conversation
          .map((m) => `${m.role === 'user' ? 'Claimant' : 'Assistant'}: ${m.content}`)
          .join('\n')
      : 'No conversation recorded.';

    const prompt = `You are a senior litigation analyst at a mass tort law firm. Analyze this case and provide a comprehensive AI assessment.

## Campaign Context
${campaignLines.length ? campaignLines.join('\n') : 'No campaign linked.'}

## Claimant
Name: ${(intakePayload.full_name as string) ?? 'unknown'}
Date of birth: ${(intakePayload.date_of_birth as string) ?? 'not provided'}
Case type: ${caseEntity.case_type ?? 'unknown'}
Injury date: ${caseEntity.injury_date ?? (intakePayload.injury_date as string) ?? 'not provided'}

## AI Intake Summary
${aiChatSummary || 'Not available.'}

## Key Facts Extracted from Intake
${keyFacts.length ? keyFacts.map((f) => `- ${f}`).join('\n') : 'None extracted.'}

## Intake Qualification Score
${qualificationScore != null ? `${qualificationScore}/100` : 'Not scored.'}

## Intake Conversation
${transcriptText}

---

Provide the following scores and analysis:

### case_strength_score (0–100)
Overall litigation strength. Consider: specificity of injury, exposure evidence, medical documentation, clear defendant liability, quantifiable damages.
80–100 = Excellent; 60–79 = Good; 40–59 = Moderate; 20–39 = Weak; 0–19 = Very weak.

### credibility_score (0–100)
Claimant credibility and consistency. High (70+) = consistent, specific, corroborated. Medium (40–69) = some gaps or vagueness. Low (<40) = contradictions or suspicious elements.

### settlement_probability (0–100)
Probability of settlement vs. dismissal. Consider: MDL status, qualifying criteria match, damages magnitude, defendant litigation posture.

### fraud_score (0–100)
Fraud risk. 0 = no concerns, 100 = strong fraud indicators. Look for: implausible claims, inconsistencies, suspicious timing, known fraud patterns for this campaign.

### ai_risk_factors
2–5 specific litigation risks (e.g. "No medical records within 6 months of injury", "Statute of limitations may be approaching", "Exposure to defendant product unconfirmed").

### ai_strength_factors
2–5 specific strengths (e.g. "Documented ER visit day of injury", "Product serial number provided", "Multiple named witnesses").

### ai_case_summary
2–3 sentence attorney-facing summary of the case's overall position and recommended next steps.`;

    const result = (await this.integrationsService.invokeLLM(prompt, ANALYSIS_SCHEMA)) as {
      case_strength_score: number;
      credibility_score: number;
      settlement_probability: number;
      fraud_score: number;
      ai_risk_factors: string[];
      ai_strength_factors: string[];
      ai_case_summary: string;
    };

    await this.caseRepo.update(caseId, {
      case_strength_score: result.case_strength_score,
      credibility_score: result.credibility_score,
      settlement_probability: result.settlement_probability,
      fraud_score: result.fraud_score,
      ai_risk_factors: result.ai_risk_factors,
      ai_strength_factors: result.ai_strength_factors,
      ai_case_summary: result.ai_case_summary,
    });

    return this.caseRepo.findOne({ where: { id: caseId } }) as Promise<CaseEntity>;
  }
}
