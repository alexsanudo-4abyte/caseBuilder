import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { DocumentEntity } from './document.entity';
export declare class DocumentService extends CrudService<DocumentEntity> {
    constructor(repo: Repository<DocumentEntity>);
}
