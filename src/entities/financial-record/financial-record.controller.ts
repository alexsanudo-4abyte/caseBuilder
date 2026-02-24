import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { FinancialRecordEntity } from './financial-record.entity';
import { FinancialRecordService } from './financial-record.service';

@Controller('financial-records')
export class FinancialRecordController extends CrudController<FinancialRecordEntity> {
  constructor(service: FinancialRecordService) {
    super(service);
  }
}
