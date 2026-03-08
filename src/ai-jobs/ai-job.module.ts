import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiJobEntity } from './ai-job.entity';
import { AiJobService } from './ai-job.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiJobEntity]), IntegrationsModule],
  providers: [AiJobService],
  exports: [AiJobService],
})
export class AiJobModule {}
