import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { CaseEntity } from '../case/case.entity';

@Entity('documents')
export class DocumentEntity extends BaseEntity {
  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: CaseEntity;

  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  document_type: string;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  uploaded_by: string; // user ID

  @Column({ nullable: true })
  uploaded_at: string;

  @Column({ nullable: true, default: 1 })
  document_version: number;

  @Column({ nullable: true, default: false })
  requires_authorization: boolean;
}
