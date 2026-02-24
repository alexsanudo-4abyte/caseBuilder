import { CrudController } from '../../shared/crud.controller';
import { IntakeSubmissionEntity } from './intake-submission.entity';
import { IntakeSubmissionService } from './intake-submission.service';
export declare class IntakeSubmissionController extends CrudController<IntakeSubmissionEntity> {
    constructor(service: IntakeSubmissionService);
}
