import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('notifications')
@Roles(Role.ADMIN, Role.ATTORNEY, Role.INTAKE_STAFF, Role.CASE_MANAGER)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  list(@Query('limit') limit?: string) {
    return this.service.list(limit ? +limit : 50);
  }

  @Get('unread-count')
  async unreadCount() {
    const count = await this.service.unreadCount();
    return { count };
  }

  @Patch('read-all')
  async markAllRead() {
    await this.service.markAllRead();
    return { ok: true };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    await this.service.markRead(id);
    return { ok: true };
  }
}
