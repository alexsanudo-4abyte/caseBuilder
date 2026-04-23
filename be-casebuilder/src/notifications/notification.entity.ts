import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
  @Column()
  type: string; // 'new_submission' | 'conversation_updated' | 'document_uploaded' | 'contact_updated'

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  submission_id: string;

  @Column({ nullable: true })
  claimant_name: string;

  @Column({ default: false })
  read: boolean;
}
