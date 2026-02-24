import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { FraudAlertEntity } from './fraud-alert.entity';
export declare class FraudAlertService extends CrudService<FraudAlertEntity> {
    constructor(repo: Repository<FraudAlertEntity>);
}
