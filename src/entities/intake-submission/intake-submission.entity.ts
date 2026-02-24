import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';

@Entity('intake_submissions')
export class IntakeSubmissionEntity extends BaseEntity {
  @Column({ nullable: true })
  conversation_id: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  date_of_birth: string;

  @Column({ nullable: true, type: 'text' })
  ai_chat_summary: string;

  @Column({ nullable: true, type: 'jsonb' })
  key_facts: string[];

  @Column({ nullable: true, type: 'decimal' })
  qualification_score: number;

  @Column({ nullable: true })
  case_type: string;

  @Column({ nullable: true, default: 'pending_review' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  admin_notes: string;

  @Column({ nullable: true })
  reviewed_by: string;

  @Column({ nullable: true })
  reviewed_date: string;

  @Column({ nullable: true })
  submitted_date: string;
}
