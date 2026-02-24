import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { CaseEntity } from '../case/case.entity';

@Entity('medical_records')
export class MedicalRecordEntity extends BaseEntity {
  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CaseEntity;

  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  provider_name: string;

  @Column({ nullable: true })
  provider_type: string;

  @Column({ nullable: true })
  provider_address: string;

  @Column({ nullable: true })
  provider_phone: string;

  @Column({ nullable: true, default: 'pending' })
  request_status: string;

  @Column({ nullable: true })
  request_date: string;

  @Column({ nullable: true })
  records_start_date: string;

  @Column({ nullable: true })
  records_end_date: string;

  @Column({ nullable: true, type: 'decimal' })
  severity_score: number;

  @Column({ nullable: true })
  qualifying_diagnosis_found: boolean;

  @Column({ nullable: true, default: 'pending' })
  ai_analysis_status: string;

  @Column({ nullable: true, type: 'text' })
  ai_medical_summary: string;

  @Column({ nullable: true, type: 'jsonb' })
  diagnoses_extracted: string[];

  @Column({ nullable: true, type: 'jsonb' })
  procedures_extracted: string[];

  @Column({ nullable: true, type: 'jsonb' })
  medications_extracted: string[];

  @Column({ nullable: true, type: 'jsonb' })
  ai_timeline: any[];
}
