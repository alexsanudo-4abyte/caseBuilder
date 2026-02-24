import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { MedicalRecordEntity } from './medical-record.entity';

@Injectable()
export class MedicalRecordService extends CrudService<MedicalRecordEntity> {
  constructor(
    @InjectRepository(MedicalRecordEntity)
    repo: Repository<MedicalRecordEntity>,
  ) {
    super(repo);
  }
}
