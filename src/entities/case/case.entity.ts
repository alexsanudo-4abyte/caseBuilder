import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';

@Entity('cases')
export class CaseEntity extends BaseEntity {
  @Column({ nullable: true })
  claimant_name: string;

  @Column({ nullable: true })
  claimant_email: string;

  @Column({ nullable: true })
  claimant_phone: string;

  @Column({ nullable: true })
  claimant_address: string;

  @Column({ nullable: true })
  claimant_dob: string;

  @Column({ nullable: true })
  case_number: string;

  @Column({ nullable: true })
  case_type: string;

  @Column({ nullable: true })
  tort_campaign: string;

  @Column({ nullable: true, default: 'intake' })
  status: string;

  @Column({ nullable: true })
  priority: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'text' })
  injury_description: string;

  @Column({ nullable: true })
  injury_date: string;

  @Column({ nullable: true })
  intake_source: string;

  @Column({ nullable: true })
  intake_date: string;

  @Column({ nullable: true })
  assigned_attorney: string;

  @Column({ nullable: true, type: 'decimal' })
  estimated_value_low: number;

  @Column({ nullable: true, type: 'decimal' })
  estimated_value_high: number;

  @Column({ nullable: true, type: 'decimal' })
  case_strength_score: number;

  @Column({ nullable: true, type: 'decimal' })
  credibility_score: number;

  @Column({ nullable: true, type: 'decimal' })
  settlement_probability: number;

  @Column({ nullable: true, type: 'decimal' })
  fraud_score: number;

  @Column({ nullable: true, type: 'text' })
  ai_case_summary: string;

  @Column({ nullable: true, type: 'jsonb' })
  ai_risk_factors: string[];

  @Column({ nullable: true, type: 'jsonb' })
  ai_strength_factors: string[];

  @Column({ nullable: true })
  qualifying_criteria_met: boolean;
}
