import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { CaseEntity } from './case.entity';

@Injectable()
export class CaseService extends CrudService<CaseEntity> {
  constructor(
    @InjectRepository(CaseEntity)
    repo: Repository<CaseEntity>,
  ) {
    super(repo);
  }
}
