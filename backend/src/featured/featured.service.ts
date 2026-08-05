import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const TIER_DAYS: Record<string, number> = {
  '7day': 7,
  '30day': 30,
};

@Injectable()
export class FeaturedService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async applyBoost(propertyId: string, tier: '7day' | '30day') {
    const days = TIER_DAYS[tier];
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + days);

    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        is_featured: true,
        featured_tier: tier === '7day' ? 'standard' : 'premium',
        featured_until: featuredUntil,
      },
    });
  }

  async purchaseBoost(ownerId: string, propertyId: string, tier: '7day' | '30day') {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.owner_id !== ownerId) throw new ForbiddenException();
    // The actual payment initiation is done in PaymentsService.
    // This is called post-payment-success by the webhook.
    return this.applyBoost(propertyId, tier);
  }

  /** Hourly cron: expire featured listings whose time has passed */
  @Cron(CronExpression.EVERY_HOUR)
  async expireFeaturedListings() {
    const expired = await this.prisma.property.findMany({
      where: { is_featured: true, featured_until: { lt: new Date() } },
      select: { id: true, owner_id: true, title: true },
    });

    if (expired.length === 0) return;

    await this.prisma.property.updateMany({
      where: { id: { in: expired.map((p) => p.id) } },
      data: { is_featured: false, featured_tier: null, featured_until: null },
    });

    // Notify owners that their boost expired
    await Promise.all(
      expired.map((p) =>
        this.notifications.createNotification(p.owner_id, 'boost_expired', {
          content: `Your featured boost for "${p.title}" has expired. Renew to keep your listing at the top.`,
          data: { property_id: p.id },
        }),
      ),
    );

    console.log(`Expired ${expired.length} featured listing(s).`);
  }
}
