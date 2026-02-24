import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { MedicalRecordEntity } from './medical-record.entity';
import { MedicalRecordService } from './medical-record.service';

@Controller('medical-records')
export class MedicalRecordController extends CrudController<MedicalRecordEntity> {
  constructor(service: MedicalRecordService) {
    super(service);
  }
}
