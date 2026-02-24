import { CrudController } from '../../shared/crud.controller';
import { FinancialRecordEntity } from './financial-record.entity';
import { FinancialRecordService } from './financial-record.service';
export declare class FinancialRecordController extends CrudController<FinancialRecordEntity> {
    constructor(service: FinancialRecordService);
}
