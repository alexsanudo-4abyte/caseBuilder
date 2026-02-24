import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { FraudAlertEntity } from './fraud-alert.entity';
import { FraudAlertService } from './fraud-alert.service';

@Controller('fraud-alerts')
export class FraudAlertController extends CrudController<FraudAlertEntity> {
  constructor(service: FraudAlertService) {
    super(service);
  }
}
