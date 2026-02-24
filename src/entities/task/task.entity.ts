import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';

@Entity('tasks')
export class TaskEntity extends BaseEntity {
  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  task_type: string;

  @Column({ nullable: true, default: 'pending' })
  status: string;

  @Column({ nullable: true })
  priority: string;
}
