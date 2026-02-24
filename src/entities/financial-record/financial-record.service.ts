import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { FinancialRecordEntity } from './financial-record.entity';

@Injectable()
export class FinancialRecordService extends CrudService<FinancialRecordEntity> {
  constructor(
    @InjectRepository(FinancialRecordEntity)
    repo: Repository<FinancialRecordEntity>,
  ) {
    super(repo);
  }
}
