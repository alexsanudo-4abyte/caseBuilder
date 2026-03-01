import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { encryptedString } from '../../shared/transformers';

@Entity('claimants')
export class ClaimantEntity extends BaseEntity {
  @Column({ nullable: true, transformer: encryptedString })
  full_name: string;

  @Column({ nullable: true, transformer: encryptedString })
  email: string;

  @Column({ nullable: true, transformer: encryptedString })
  phone: string;

  @Column({ nullable: true, transformer: encryptedString })
  address: string;

  @Column({ nullable: true, transformer: encryptedString })
  date_of_birth: string;

  @Column({ nullable: true })
  intake_channel: string; // web_form|partner_api|phone|referral

  @Column({ nullable: true, default: false })
  consent_given: boolean;

  @Column({ nullable: true })
  consent_timestamp: string;

  @Column({ nullable: true })
  consent_version: string; // e.g. "v1.2"
}
