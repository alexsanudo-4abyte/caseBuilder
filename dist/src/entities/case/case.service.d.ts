import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { CaseEntity } from './case.entity';
export declare class CaseService extends CrudService<CaseEntity> {
    constructor(repo: Repository<CaseEntity>);
}
