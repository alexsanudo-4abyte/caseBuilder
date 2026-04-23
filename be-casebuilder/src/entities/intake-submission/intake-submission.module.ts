import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntakeSubmissionEntity } from './intake-submission.entity';
import { IntakeSubmissionController } from './intake-submission.controller';
import { IntakeSubmissionService } from './intake-submission.service';

@Module({
  imports: [TypeOrmModule.forFeature([IntakeSubmissionEntity])],
  controllers: [IntakeSubmissionController],
  providers: [IntakeSubmissionService],
})
export class IntakeSubmissionModule {}
