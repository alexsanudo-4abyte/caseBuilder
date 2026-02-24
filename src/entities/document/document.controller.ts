import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { DocumentEntity } from './document.entity';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController extends CrudController<DocumentEntity> {
  constructor(service: DocumentService) {
    super(service);
  }
}
