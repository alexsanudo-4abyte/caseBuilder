import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { CaseEntity } from '../case/case.entity';

@Entity('fraud_alerts')
export class FraudAlertEntity extends BaseEntity {
  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CaseEntity;

  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  alert_type: string;

  @Column({ nullable: true })
  severity: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  evidence: string;

  @Column({ nullable: true, type: 'decimal' })
  ai_confidence: number;

  @Column({ nullable: true })
  detection_method: string;

  @Column({ nullable: true, default: 'open' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  resolution_notes: string;

  @Column({ nullable: true })
  reviewed_date: string;
}
