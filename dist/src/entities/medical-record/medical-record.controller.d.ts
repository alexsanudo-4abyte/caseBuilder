import { CrudController } from '../../shared/crud.controller';
import { MedicalRecordEntity } from './medical-record.entity';
import { MedicalRecordService } from './medical-record.service';
export declare class MedicalRecordController extends CrudController<MedicalRecordEntity> {
    constructor(service: MedicalRecordService);
}
