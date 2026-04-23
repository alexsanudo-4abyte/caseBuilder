import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimantEntity } from '../entities/claimant/claimant.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { DocumentEntity } from '../entities/document/document.entity';
import { TortCampaignEntity } from '../entities/tort-campaign/tort-campaign.entity';
import { IntakeGatewayController } from './intake-gateway.controller';
import { IntakeGatewayService } from './intake-gateway.service';
import { FraudAnalysisModule } from '../fraud-analysis/fraud-analysis.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { NotificationModule } from '../notifications/notification.module';
import { CaseModule } from '../entities/case/case.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClaimantEntity,
      IntakeSubmissionEntity,
      DocumentEntity,
      TortCampaignEntity,
    ]),
    FraudAnalysisModule,
    IntegrationsModule,
    NotificationModule,
    CaseModule,
  ],
  controllers: [IntakeGatewayController],
  providers: [IntakeGatewayService],
})
export class IntakeGatewayModule {}
