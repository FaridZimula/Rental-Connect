import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(action: string, targetType: string, targetId: string, actorId?: string, details?: any) {
    return this.prisma.auditLog.create({
      data: {
        action,
        target_type: targetType,
        target_id: targetId,
        actor_id: actorId,
        details: details ?? {},
      },
    });
  }

  async getLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return { data: logs, meta: { total, page, limit } };
  }
}
