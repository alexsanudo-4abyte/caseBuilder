import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimantEntity } from '../entities/claimant/claimant.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { IntakeGatewayController } from './intake-gateway.controller';
import { IntakeGatewayService } from './intake-gateway.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClaimantEntity, IntakeSubmissionEntity])],
  controllers: [IntakeGatewayController],
  providers: [IntakeGatewayService],
})
export class IntakeGatewayModule {}
