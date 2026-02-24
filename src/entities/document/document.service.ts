import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { DocumentEntity } from './document.entity';

@Injectable()
export class DocumentService extends CrudService<DocumentEntity> {
  constructor(
    @InjectRepository(DocumentEntity)
    repo: Repository<DocumentEntity>,
  ) {
    super(repo);
  }
}
