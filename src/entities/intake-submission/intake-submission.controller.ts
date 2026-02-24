import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { IntakeSubmissionEntity } from './intake-submission.entity';
import { IntakeSubmissionService } from './intake-submission.service';

@Controller('intake-submissions')
export class IntakeSubmissionController extends CrudController<IntakeSubmissionEntity> {
  constructor(service: IntakeSubmissionService) {
    super(service);
  }
}
