import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getPendingListings() {
    return this.prisma.property.findMany({
      where: { status: 'pending_review' },
      include: {
        owner: { select: { id: true, full_name: true, email: true } },
        images: { take: 3 },
        amenities: { include: { amenity: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveProperty(propertyId: string) {
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

    return updated;
  }

  async rejectProperty(propertyId: string, reason: string) {
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

    return updated;
  }

  async suspendProperty(propertyId: string, reason: string) {
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

    return updated;
  }

  async getAnalytics() {
    const [
      totalUsers,
      totalBuyers,
      totalOwners,
      totalProperties,
      publishedProperties,
      pendingProperties,
      totalLeads,
      unlockedLeads,
      totalRevenue,
      featuredActive,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'buyer' } }),
      this.prisma.user.count({ where: { role: 'owner' } }),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: 'published' } }),
      this.prisma.property.count({ where: { status: 'pending_review' } }),
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'unlocked' } }),
      this.prisma.payment.aggregate({
        where: { status: 'successful' },
        _sum: { amount: true },
      }),
      this.prisma.property.count({ where: { is_featured: true } }),
    ]);

    return {
      users: { total: totalUsers, buyers: totalBuyers, owners: totalOwners },
      properties: {
        total: totalProperties,
        published: publishedProperties,
        pending: pendingProperties,
        featured_active: featuredActive,
      },
      leads: { total: totalLeads, unlocked: unlockedLeads },
      revenue: { total_ugx: totalRevenue._sum.amount ?? 0 },
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
          role: true,
          is_verified: true,
          created_at: true,
          _count: { select: { properties: true, leads_as_buyer: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, meta: { total, page, limit } };
  }
}
