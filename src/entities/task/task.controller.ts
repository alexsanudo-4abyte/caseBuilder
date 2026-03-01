import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { TaskEntity } from './task.entity';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Controller('tasks')
export class TaskController extends CrudController<TaskEntity> {
  constructor(readonly service: TaskService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(id, dto);
  }
}
