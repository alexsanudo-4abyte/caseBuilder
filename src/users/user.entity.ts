import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'attorney' })
  role: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  firm_name: string;

  @Column({ nullable: true })
  office_address: string;
}
