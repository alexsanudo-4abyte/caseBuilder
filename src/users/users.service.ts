import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOneBy({ email });
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOneBy({ id });
  }

  findAllStaff(): Promise<UserEntity[]> {
    return this.repo.find({
      where: { role: Not('claimant') },
      order: { full_name: 'ASC' },
    });
  }

  create(data: Partial<UserEntity>): Promise<UserEntity> {
    return this.repo.save(this.repo.create(data as UserEntity));
  }

  async update(id: string, data: Partial<UserEntity>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
