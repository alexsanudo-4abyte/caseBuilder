import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';

@Entity('predictions')
export class PredictionEntity extends BaseEntity {
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
