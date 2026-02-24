import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { FinancialRecordEntity } from './financial-record.entity';
export declare class FinancialRecordService extends CrudService<FinancialRecordEntity> {
    constructor(repo: Repository<FinancialRecordEntity>);
}
