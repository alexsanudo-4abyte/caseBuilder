import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { MedicalRecordEntity } from './medical-record.entity';
export declare class MedicalRecordService extends CrudService<MedicalRecordEntity> {
    constructor(repo: Repository<MedicalRecordEntity>);
}
