import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { ClaimantEntity } from './claimant.entity';
import { ClaimantService } from './claimant.service';

@Controller('claimants')
export class ClaimantController extends CrudController<ClaimantEntity> {
  constructor(service: ClaimantService) {
    super(service);
  }
}
