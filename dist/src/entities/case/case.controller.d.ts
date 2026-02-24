import { CrudController } from '../../shared/crud.controller';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';
export declare class CaseController extends CrudController<CaseEntity> {
    constructor(service: CaseService);
}
