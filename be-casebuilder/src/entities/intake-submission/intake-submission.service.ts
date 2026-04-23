import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { IntakeSubmissionEntity } from './intake-submission.entity';

@Injectable()
export class IntakeSubmissionService extends CrudService<IntakeSubmissionEntity> {
  constructor(
    @InjectRepository(IntakeSubmissionEntity)
    repo: Repository<IntakeSubmissionEntity>,
  ) {
    super(repo);
  }
}
