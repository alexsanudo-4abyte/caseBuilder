import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseEntity } from './case.entity';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { CaseAnalysisService } from './case-analysis.service';
import { IntakeSubmissionEntity } from '../intake-submission/intake-submission.entity';
import { TortCampaignEntity } from '../tort-campaign/tort-campaign.entity';
import { IntegrationsModule } from '../../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CaseEntity, IntakeSubmissionEntity, TortCampaignEntity]),
    IntegrationsModule,
  ],
  controllers: [CaseController],
  providers: [CaseService, CaseAnalysisService],
  exports: [CaseAnalysisService],
})
export class CaseModule {}
