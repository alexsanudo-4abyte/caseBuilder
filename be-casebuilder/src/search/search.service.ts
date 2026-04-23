import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseEntity } from '../entities/case/case.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(CaseEntity)
    private readonly caseRepo: Repository<CaseEntity>,
    @InjectRepository(IntakeSubmissionEntity)
    private readonly submissionRepo: Repository<IntakeSubmissionEntity>,
  ) {}

  async search(query: string) {
    const q = `%${query}%`;

    const [cases, submissions] = await Promise.all([
      this.caseRepo
        .createQueryBuilder('c')
        .where(
          'c.claimant_name ILIKE :q OR c.claimant_email ILIKE :q OR c.case_number ILIKE :q OR c.case_type ILIKE :q OR c.injury_description ILIKE :q',
          { q },
        )
        .orderBy('c.created_date', 'DESC')
        .take(6)
        .getMany(),

      this.submissionRepo
        .createQueryBuilder('s')
        .where(
          `s.ai_chat_summary ILIKE :q OR s.case_type ILIKE :q OR s.raw_payload->>'full_name' ILIKE :q OR s.raw_payload->>'email' ILIKE :q OR s.raw_payload->>'phone' ILIKE :q`,
          { q },
        )
        .orderBy('s.created_date', 'DESC')
        .take(6)
        .getMany(),
    ]);

    return { cases, submissions };
  }
}
