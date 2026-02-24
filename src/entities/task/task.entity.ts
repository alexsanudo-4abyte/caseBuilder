import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { CaseEntity } from '../case/case.entity';

@Entity('tasks')
export class TaskEntity extends BaseEntity {
  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CaseEntity;

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

  @Column({ nullable: true })
  assigned_to: string; // user ID

  @Column({ nullable: true })
  due_date: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;
}
