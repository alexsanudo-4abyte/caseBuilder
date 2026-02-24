import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { IntakeSubmissionEntity } from './intake-submission.entity';
export declare class IntakeSubmissionService extends CrudService<IntakeSubmissionEntity> {
    constructor(repo: Repository<IntakeSubmissionEntity>);
}
