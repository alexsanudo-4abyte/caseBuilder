import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { FraudAlertEntity } from './fraud-alert.entity';

@Injectable()
export class FraudAlertService extends CrudService<FraudAlertEntity> {
  constructor(
    @InjectRepository(FraudAlertEntity)
    repo: Repository<FraudAlertEntity>,
  ) {
    super(repo);
  }
}
