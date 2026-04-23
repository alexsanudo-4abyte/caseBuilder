import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { TaskEntity } from './task.entity';

@Injectable()
export class TaskService extends CrudService<TaskEntity> {
  constructor(
    @InjectRepository(TaskEntity)
    repo: Repository<TaskEntity>,
  ) {
    super(repo);
  }
}
