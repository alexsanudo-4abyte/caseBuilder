import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { PredictionEntity } from './prediction.entity';
export declare class PredictionService extends CrudService<PredictionEntity> {
    constructor(repo: Repository<PredictionEntity>);
}
