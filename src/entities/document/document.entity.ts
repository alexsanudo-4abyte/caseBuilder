import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';

@Entity('documents')
export class DocumentEntity extends BaseEntity {
  @Column({ nullable: true })
  case_id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  document_type: string;

  @Column({ nullable: true })
  file_url: string;
}
