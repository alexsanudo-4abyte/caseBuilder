import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';

@Entity('tort_campaigns')
export class TortCampaignEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, default: 'active' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'jsonb' })
  defendants: string[];

  @Column({ nullable: true, type: 'text' })
  statute_of_limitations_info: string;

  @Column({ nullable: true, type: 'text' })
  mdl_info: string;

  @Column({ nullable: true, type: 'decimal' })
  estimated_avg_settlement: number;

  @Column({ nullable: true, type: 'text' })
  qualifying_criteria: string;
}
