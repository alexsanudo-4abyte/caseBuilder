import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { CommunicationEntity } from './communication.entity';

@Injectable()
export class CommunicationService extends CrudService<CommunicationEntity> {
  constructor(
    @InjectRepository(CommunicationEntity)
    repo: Repository<CommunicationEntity>,
  ) {
    super(repo);
  }
}
