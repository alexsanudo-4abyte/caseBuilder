import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { PredictionEntity } from './prediction.entity';

@Injectable()
export class PredictionService extends CrudService<PredictionEntity> {
  constructor(
    @InjectRepository(PredictionEntity)
    repo: Repository<PredictionEntity>,
  ) {
    super(repo);
  }
}
