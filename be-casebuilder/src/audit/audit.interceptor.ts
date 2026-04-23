import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditAction } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';

// Entities whose GET endpoints are sensitive enough to audit
const SENSITIVE_ENTITY_TYPES = new Set([
  'medical-records',
  'fraud-alerts',
  'predictions',
  'financial-records',
]);

const METHOD_ACTION_MAP: Record<string, AuditAction> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    const url: string = req.url;
    const isMutation = method in METHOD_ACTION_MAP;
    const entityType = this.extractEntityType(url);
    const isSensitiveRead =
      method === 'GET' && SENSITIVE_ENTITY_TYPES.has(entityType);

    if (!isMutation && !isSensitiveRead) return next.handle();

    const user = req.user;
    const action: AuditAction = METHOD_ACTION_MAP[method] ?? 'READ';
    const entityId: string | undefined = req.params?.id;
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ??
      req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return next.handle().pipe(
      tap((result) => {
        let changes: Record<string, any> | undefined;

        if (action === 'CREATE') {
          changes = { created: result };
        } else if (action === 'UPDATE') {
          changes = { body: req.body, result };
        }
        // DELETE and READ: no changes payload needed

        this.auditLogService.log({
          userId: user?.userId,
          userEmail: user?.email,
          userRole: user?.role,
          action,
          entityType,
          entityId,
          changes,
          ipAddress,
          userAgent,
        });
      }),
    );
  }

  private extractEntityType(url: string): string {
    // Strip /api prefix and query string, take first path segment
    const path = url.replace(/^\/api\//, '').split('?')[0];
    return path.split('/')[0];
  }
}
