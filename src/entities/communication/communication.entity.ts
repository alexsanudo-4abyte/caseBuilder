import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { CaseEntity } from '../case/case.entity';

@Entity('communications')
export class CommunicationEntity extends BaseEntity {
  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CaseEntity;

  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  channel: string;

  @Column({ nullable: true })
  to_name: string;

  @Column({ nullable: true })
  to_contact: string;

  @Column({ nullable: true })
  from_name: string;

  @Column({ nullable: true })
  from_contact: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ nullable: true })
  direction: string;

  @Column({ nullable: true })
  communication_date: string;

  @Column({ nullable: true, default: false })
  is_read: boolean;

  @Column({ nullable: true })
  ai_sentiment: string;

  @Column({ nullable: true, type: 'text' })
  ai_summary: string;

  @Column({ nullable: true, type: 'jsonb' })
  ai_action_items: string[];

  @Column({ nullable: true, default: false })
  requires_response: boolean;
}
