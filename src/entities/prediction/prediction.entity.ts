import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { CaseEntity } from '../case/case.entity';

@Entity('predictions')
export class PredictionEntity extends BaseEntity {
  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CaseEntity;

  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  prediction_type: string;

  @Column({ nullable: true, type: 'decimal' })
  predicted_value: number;

  @Column({ nullable: true, type: 'decimal' })
  predicted_range_low: number;

  @Column({ nullable: true, type: 'decimal' })
  predicted_range_high: number;

  @Column({ nullable: true, type: 'decimal' })
  confidence_score: number;

  @Column({ nullable: true, type: 'text' })
  explanation: string;

  @Column({ nullable: true, type: 'jsonb' })
  key_factors: string[];

  @Column({ nullable: true, default: true })
  is_current: boolean;

  @Column({ nullable: true })
  prediction_date: string;

  @Column({ nullable: true })
  model_version: string;
}
