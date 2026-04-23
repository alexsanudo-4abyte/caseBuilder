import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiJobEntity } from './ai-job.entity';
import { IntegrationsService } from '../integrations/integrations.service';

interface RunOptions {
  analysisType: string;
  entityType: string;
  entityId: string;
  prompt: string;
  triggeredBy: string;
  schema: object;
}

@Injectable()
export class AiJobService {
  constructor(
    @InjectRepository(AiJobEntity)
    private readonly aiJobRepo: Repository<AiJobEntity>,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async run(
    options: RunOptions,
  ): Promise<{ job: AiJobEntity; result: unknown }> {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

    const job = this.aiJobRepo.create({
      analysis_type: options.analysisType,
      entity_type: options.entityType,
      entity_id: options.entityId,
      prompt: options.prompt,
      model,
      status: 'pending',
      triggered_by: options.triggeredBy,
    });
    await this.aiJobRepo.save(job);

    try {
      const result = await this.integrationsService.invokeLLM(
        options.prompt,
        options.schema,
      );
      job.raw_response = JSON.stringify(result);
      job.status = 'complete';
      await this.aiJobRepo.save(job);
      return { job, result };
    } catch (err) {
      job.error = err instanceof Error ? err.message : String(err);
      job.status = 'failed';
      await this.aiJobRepo.save(job);
      throw err;
    }
  }
}
