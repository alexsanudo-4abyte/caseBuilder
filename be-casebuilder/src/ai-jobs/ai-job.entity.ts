import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';

@Entity('ai_jobs')
export class AiJobEntity extends BaseEntity {
  @Column()
  analysis_type: string;

  @Column()
  entity_type: string;

  @Column()
  entity_id: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text', nullable: true })
  raw_response: string;

  @Column()
  model: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column()
  triggered_by: string;
}
