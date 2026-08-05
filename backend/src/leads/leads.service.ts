import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { scrubContactInfo } from '../common/utils/contact-scrubber';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(buyerId: string, dto: CreateLeadDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.property_id, status: 'published' },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.owner_id === buyerId)
      throw new BadRequestException('Owners cannot connect to their own listings');

    // Prevent duplicate active leads
    const existing = await this.prisma.lead.findFirst({
      where: {
        buyer_id: buyerId,
        property_id: dto.property_id,
        status: { in: ['pending_payment', 'unlocked'] },
      },
    });
    if (existing) return existing;

    // Scrub buyer message for contact info before saving
    const safeMessage = dto.buyer_message ? scrubContactInfo(dto.buyer_message) : undefined;

    return this.prisma.lead.create({
      data: {
        property_id: dto.property_id,
        buyer_id: buyerId,
        owner_id: property.owner_id,
        buyer_message: safeMessage,
        status: 'pending_payment',
      },
    });
  }

  /**
   * Unlock a lead by spending a credit from the buyer's wallet.
   * Returns full contact info only after successful unlock.
   */
  async unlockWithCredit(leadId: string, buyerId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { property: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.buyer_id !== buyerId) throw new ForbiddenException();
    if (lead.status === 'unlocked') return this.getUnlockedLead(leadId, buyerId);

    const wallet = await this.prisma.creditWallet.findUnique({ where: { user_id: buyerId } });
    if (!wallet || wallet.balance < 1)
      throw new BadRequestException('Insufficient credits. Purchase a credit bundle to unlock.');

    // Atomic: deduct credit + unlock lead
    await this.prisma.$transaction([
      this.prisma.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: 1 } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          wallet_id: wallet.id,
          type: 'spend',
          amount: 1,
          related_lead_id: leadId,
        },
      }),
      this.prisma.lead.update({
        where: { id: leadId },
        data: { status: 'unlocked', credit_used: true, unlocked_at: new Date() },
      }),
    ]);

    // Notify owner
    await this.notifications.createNotification(lead.owner_id, 'new_lead', {
      content: `A buyer has connected with your property "${lead.property.title}".`,
      data: { lead_id: leadId, property_id: lead.property_id },
    });

    return this.getUnlockedLead(leadId, buyerId);
  }

  /**
   * Returns the full lead including owner & buyer contact info.
   * Only accessible to the buyer (and the owner) after the lead is unlocked.
   */
  async getUnlockedLead(leadId: string, requesterId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            display_zone: true,
            price: true,
            // Real address revealed post-connection
            real_address: true,
          },
        },
        buyer: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
        owner: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.buyer_id !== requesterId && lead.owner_id !== requesterId)
      throw new ForbiddenException();
    if (lead.status !== 'unlocked')
      throw new ForbiddenException('Lead not yet unlocked. Complete payment first.');

    return lead;
  }

  /** Owner: view all unlocked leads for their properties */
  async getOwnerLeads(ownerId: string) {
    return this.prisma.lead.findMany({
      where: { owner_id: ownerId, status: 'unlocked' },
      include: {
        property: { select: { id: true, title: true, display_zone: true } },
        buyer: { select: { id: true, full_name: true, email: true, phone: true } },
      },
      orderBy: { unlocked_at: 'desc' },
    });
  }

  /** Buyer: view their own leads (status, not yet revealed) */
  async getBuyerLeads(buyerId: string) {
    return this.prisma.lead.findMany({
      where: { buyer_id: buyerId },
      include: {
        property: { select: { id: true, title: true, display_zone: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
