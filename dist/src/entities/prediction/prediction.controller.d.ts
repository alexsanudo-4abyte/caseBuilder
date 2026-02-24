import { CrudController } from '../../shared/crud.controller';
import { PredictionEntity } from './prediction.entity';
import { PredictionService } from './prediction.service';
export declare class PredictionController extends CrudController<PredictionEntity> {
    constructor(service: PredictionService);
}
