import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLogEntity } from './audit-log.entity';

export interface AuditContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  log(ctx: AuditContext): void {
    // Fire-and-forget — never throw or block the request
    this.repo
      .save({
        user_id: ctx.userId,
        user_email: ctx.userEmail,
        user_role: ctx.userRole,
        action: ctx.action,
        entity_type: ctx.entityType,
        entity_id: ctx.entityId,
        changes: ctx.changes,
        ip_address: ctx.ipAddress,
        user_agent: ctx.userAgent,
      })
      .catch((err) => console.error('[AuditLog] Failed to write log entry:', err));
  }
}
