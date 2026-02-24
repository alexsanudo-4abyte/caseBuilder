import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { CaseEntity } from '../case/case.entity';

@Entity('financial_records')
export class FinancialRecordEntity extends BaseEntity {
  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CaseEntity;

  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  record_type: string;

  @Column({ nullable: true, type: 'decimal' })
  amount: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  description: string;
}
