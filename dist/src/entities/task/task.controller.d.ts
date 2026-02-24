import { CrudController } from '../../shared/crud.controller';
import { TaskEntity } from './task.entity';
import { TaskService } from './task.service';
export declare class TaskController extends CrudController<TaskEntity> {
    constructor(service: TaskService);
}
