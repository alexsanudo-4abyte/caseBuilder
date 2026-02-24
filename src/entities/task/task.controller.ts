import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { TaskEntity } from './task.entity';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController extends CrudController<TaskEntity> {
  constructor(service: TaskService) {
    super(service);
  }
}
