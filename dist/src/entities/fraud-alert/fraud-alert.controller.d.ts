import { CrudController } from '../../shared/crud.controller';
import { FraudAlertEntity } from './fraud-alert.entity';
import { FraudAlertService } from './fraud-alert.service';
export declare class FraudAlertController extends CrudController<FraudAlertEntity> {
    constructor(service: FraudAlertService);
}
