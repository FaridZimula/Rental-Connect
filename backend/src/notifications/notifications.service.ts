import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface NotificationPayload {
  content: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, type: string, payload: NotificationPayload) {
    return this.prisma.notification.create({
      data: {
        user_id: userId,
        type: type as any,
        content: payload.content,
        data: payload.data ?? {},
      },
    });
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { is_read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }
}
