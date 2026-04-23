import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  user_email: string;

  @Column({ nullable: true })
  user_role: string;

  @Column()
  action: AuditAction;

  @Column()
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  // For CREATE: the created record. For UPDATE: { body, result }. For DELETE: entity_id only.
  @Column({ nullable: true, type: 'jsonb' })
  changes: Record<string, any>;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;
}
