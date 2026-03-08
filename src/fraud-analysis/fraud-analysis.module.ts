import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudAlertEntity } from '../entities/fraud-alert/fraud-alert.entity';
import { FraudAnalysisService } from './fraud-analysis.service';
import { AiJobModule } from '../ai-jobs/ai-job.module';

@Module({
  imports: [TypeOrmModule.forFeature([FraudAlertEntity]), AiJobModule],
  providers: [FraudAnalysisService],
  exports: [FraudAnalysisService],
})
export class FraudAnalysisModule {}
