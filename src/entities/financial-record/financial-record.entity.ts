import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';

@Entity('financial_records')
export class FinancialRecordEntity extends BaseEntity {
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
