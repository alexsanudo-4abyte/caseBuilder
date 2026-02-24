import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';

@Controller('cases')
export class CaseController extends CrudController<CaseEntity> {
  constructor(service: CaseService) {
    super(service);
  }
}
