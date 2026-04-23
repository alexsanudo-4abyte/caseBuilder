import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseEntity } from '../entities/case/case.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaseEntity, IntakeSubmissionEntity])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
