import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  create(data: {
    type: string;
    message: string;
    submission_id?: string;
    claimant_name?: string;
  }): Promise<NotificationEntity> {
    return this.repo.save(this.repo.create(data));
  }

  list(limit = 50): Promise<NotificationEntity[]> {
    return this.repo.find({
      order: { created_date: 'DESC' },
      take: limit,
    });
  }

  async unreadCount(): Promise<number> {
    return this.repo.count({ where: { read: false } });
  }

  async markRead(id: string): Promise<void> {
    await this.repo.update(id, { read: true });
  }

  async markAllRead(): Promise<void> {
    await this.repo.update({ read: false }, { read: true });
  }
}
