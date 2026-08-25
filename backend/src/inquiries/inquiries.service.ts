import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateInquiryDto, RespondInquiryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(tenantId: string, dto: CreateInquiryDto) {
    const property = await this.prisma.property.findUnique({ where: { id: dto.property_id } });
    if (!property) throw new NotFoundException('Property not found');

    const inquiry = await this.prisma.inquiry.create({
      data: {
        property_id: dto.property_id,
        tenant_id: tenantId,
        landlord_id: property.owner_id,
        message: dto.message,
        viewing_date: dto.viewing_date ? new Date(dto.viewing_date) : null,
      },
      include: {
        property: { select: { id: true, title: true, display_zone: true } },
        tenant: { select: { id: true, full_name: true, email: true, phone: true } },
      },
    });

    await this.notifications.createNotification(property.owner_id, 'new_inquiry', {
      content: `New inquiry received for property "${property.title}".`,
      data: { inquiry_id: inquiry.id, property_id: property.id },
    });

    return inquiry;
  }

  async respond(inquiryId: string, landlordId: string, dto: RespondInquiryDto) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    if (inquiry.landlord_id !== landlordId) throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        response: dto.response,
        status: 'responded',
        responded_at: new Date(),
      },
    });

    await this.notifications.createNotification(inquiry.tenant_id, 'inquiry_responded', {
      content: `Landlord replied to your inquiry.`,
      data: { inquiry_id: inquiry.id, property_id: inquiry.property_id },
    });

    return updated;
  }

  async findTenantInquiries(tenantId: string) {
    return this.prisma.inquiry.findMany({
      where: { tenant_id: tenantId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            display_zone: true,
            price: true,
            images: { where: { is_primary: true }, take: 1 },
          },
        },
        landlord: { select: { id: true, full_name: true, phone: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findLandlordInquiries(landlordId: string) {
    return this.prisma.inquiry.findMany({
      where: { landlord_id: landlordId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            display_zone: true,
            images: { where: { is_primary: true }, take: 1 },
          },
        },
        tenant: { select: { id: true, full_name: true, phone: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
