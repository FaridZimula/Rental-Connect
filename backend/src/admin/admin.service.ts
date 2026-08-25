import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private audit: AuditService,
  ) {}

  async getPendingListings() {
    return this.prisma.property.findMany({
      where: { status: 'pending_review' },
      include: {
        owner: { select: { id: true, full_name: true, email: true, phone: true } },
        images: { take: 3 },
        amenities: { include: { amenity: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveProperty(propertyId: string, adminId?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'published', rejection_reason: null },
    });

    await this.notifications.createNotification(property.owner_id, 'listing_approved', {
      content: `Your property "${property.title}" has been approved and is now live.`,
      data: { property_id: propertyId },
    });

    await this.audit.log('listing_approved', 'property', propertyId, adminId, { title: property.title });

    return updated;
  }

  async rejectProperty(propertyId: string, reason: string, adminId?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'rejected', rejection_reason: reason },
    });

    await this.notifications.createNotification(property.owner_id, 'listing_rejected', {
      content: `Your property "${property.title}" was not approved. Reason: ${reason}`,
      data: { property_id: propertyId, reason },
    });

    await this.audit.log('listing_rejected', 'property', propertyId, adminId, { title: property.title, reason });

    return updated;
  }

  async suspendProperty(propertyId: string, reason: string, adminId?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'suspended', rejection_reason: reason },
    });

    await this.notifications.createNotification(property.owner_id, 'listing_suspended', {
      content: `Your property "${property.title}" has been suspended. Reason: ${reason}`,
      data: { property_id: propertyId, reason },
    });

    await this.audit.log('listing_suspended', 'property', propertyId, adminId, { title: property.title, reason });

    return updated;
  }

  async toggleUserActive(userId: string, adminId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { is_active: !user.is_active },
      select: { id: true, full_name: true, email: true, role: true, is_active: true },
    });

    const action = updated.is_active ? 'account_enabled' : 'account_disabled';

    await this.notifications.createNotification(userId, action as any, {
      content: updated.is_active
        ? 'Your account has been re-enabled.'
        : 'Your account has been disabled by an administrator.',
    });

    await this.audit.log(action, 'user', userId, adminId, { email: user.email });

    return updated;
  }

  async getAnalytics() {
    const [
      totalUsers,
      totalTenants,
      totalLandlords,
      totalAdmins,
      totalProperties,
      publishedProperties,
      pendingProperties,
      suspendedProperties,
      expiredProperties,
      totalInquiries,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'tenant' } }),
      this.prisma.user.count({ where: { role: 'landlord' } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: 'published' } }),
      this.prisma.property.count({ where: { status: 'pending_review' } }),
      this.prisma.property.count({ where: { status: 'suspended' } }),
      this.prisma.property.count({ where: { status: 'expired' } }),
      this.prisma.inquiry.count(),
      this.prisma.listingReport.count(),
      this.prisma.listingReport.count({ where: { status: 'pending' } }),
    ]);

    return {
      users: { total: totalUsers, tenants: totalTenants, landlords: totalLandlords, admins: totalAdmins },
      properties: {
        total: totalProperties,
        published: publishedProperties,
        pending: pendingProperties,
        suspended: suspendedProperties,
        expired: expiredProperties,
      },
      inquiries: { total: totalInquiries },
      reports: { total: totalReports, pending: pendingReports },
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          is_verified: true,
          is_active: true,
          created_at: true,
          _count: { select: { properties: true, inquiries_as_tenant: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, meta: { total, page, limit } };
  }

  async getAuditLogs(page = 1, limit = 50) {
    return this.audit.getLogs(page, limit);
  }

  /** Daily Cron to auto-expire listings that have passed expires_at date or are older than 90 days */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutoExpireListings() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const expiredListings = await this.prisma.property.updateMany({
      where: {
        status: 'published',
        OR: [
          { expires_at: { lte: new Date() } },
          { created_at: { lte: ninetyDaysAgo } },
        ],
      },
      data: { status: 'expired' },
    });

    if (expiredListings.count > 0) {
      await this.audit.log('auto_expire_cron', 'system', 'cron', 'system', {
        expired_count: expiredListings.count,
      });
    }
  }
}
