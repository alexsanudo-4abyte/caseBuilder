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
}
