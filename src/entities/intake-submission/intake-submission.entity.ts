import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { ClaimantEntity } from '../claimant/claimant.entity';
import { TortCampaignEntity } from '../tort-campaign/tort-campaign.entity';

@Entity('intake_submissions')
export class IntakeSubmissionEntity extends BaseEntity {
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

  // Populated after staff creates a case from this submission
  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true, type: 'jsonb' })
  raw_payload: Record<string, any>;

  @Column({ nullable: true })
  intake_channel: string; // web_form|partner_api|phone

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
