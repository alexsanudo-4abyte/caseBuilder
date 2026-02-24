import { CrudController } from '../../shared/crud.controller';
import { DocumentEntity } from './document.entity';
import { DocumentService } from './document.service';
export declare class DocumentController extends CrudController<DocumentEntity> {
    constructor(service: DocumentService);
}
