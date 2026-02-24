import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { ClaimantEntity } from './claimant.entity';

@Injectable()
export class ClaimantService extends CrudService<ClaimantEntity> {
  constructor(
    @InjectRepository(ClaimantEntity)
    repo: Repository<ClaimantEntity>,
  ) {
    super(repo);
  }
}
