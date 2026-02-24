import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { PredictionEntity } from './prediction.entity';
import { PredictionService } from './prediction.service';

@Controller('predictions')
export class PredictionController extends CrudController<PredictionEntity> {
  constructor(service: PredictionService) {
    super(service);
  }
}
