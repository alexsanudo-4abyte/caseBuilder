import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { ClaimantEntity } from '../claimant/claimant.entity';
import { TortCampaignEntity } from '../tort-campaign/tort-campaign.entity';

@Entity('cases')
export class CaseEntity extends BaseEntity {
  @ManyToOne(() => ClaimantEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'claimant_id' })
  claimant: ClaimantEntity;

  @Column({ nullable: true })
  claimant_id: string;

  @ManyToOne(() => TortCampaignEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tort_campaign_id' })
  tort_campaign: TortCampaignEntity;

  @Column({ nullable: true })
  tort_campaign_id: string;

  // Tracks which intake submission originated this case
  @Column({ nullable: true })
  intake_submission_id: string;

  // Denormalized for list views (populated at promotion time)
  @Column({ nullable: true })
  claimant_name: string;

  @Column({ nullable: true })
  claimant_email: string;

  @Column({ nullable: true })
  case_number: string;

  @Column({ nullable: true })
  case_type: string;

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

  @Column({ nullable: true, type: 'float' })
  estimated_value_low: number;

  @Column({ nullable: true, type: 'float' })
  estimated_value_high: number;

  @Column({ nullable: true, type: 'float' })
  case_strength_score: number;

  @Column({ nullable: true, type: 'float' })
  credibility_score: number;

  @Column({ nullable: true, type: 'float' })
  settlement_probability: number;

  @Column({ nullable: true, type: 'float' })
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
