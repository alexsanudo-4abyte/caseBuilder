import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { TaskEntity } from './task.entity';
export declare class TaskService extends CrudService<TaskEntity> {
    constructor(repo: Repository<TaskEntity>);
}
