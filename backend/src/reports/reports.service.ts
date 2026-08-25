import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateReportDto, ResolveReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(reporterId: string, dto: CreateReportDto) {
    const property = await this.prisma.property.findUnique({ where: { id: dto.property_id } });
    if (!property) throw new NotFoundException('Property not found');

    const report = await this.prisma.listingReport.create({
      data: {
        property_id: dto.property_id,
        reporter_id: reporterId,
        reason: dto.reason as any,
        details: dto.details,
      },
    });

    await this.audit.log('report_submitted', 'property', dto.property_id, reporterId, {
      reason: dto.reason,
      report_id: report.id,
    });

    return report;
  }

  async findUserReports(userId: string) {
    return this.prisma.listingReport.findMany({
      where: { reporter_id: userId },
      include: {
        property: { select: { id: true, title: true, display_zone: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAllReportsForAdmin(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.listingReport.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            display_zone: true,
            status: true,
            owner: { select: { id: true, full_name: true, email: true } },
          },
        },
        reporter: { select: { id: true, full_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async resolveReport(reportId: string, adminId: string, dto: ResolveReportDto) {
    const report = await this.prisma.listingReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const updated = await this.prisma.listingReport.update({
      where: { id: reportId },
      data: {
        status: dto.status as any,
        admin_notes: dto.admin_notes,
        resolved_by: adminId,
        resolved_at: new Date(),
      },
    });

    await this.audit.log('report_resolved', 'listing_report', reportId, adminId, {
      status: dto.status,
      admin_notes: dto.admin_notes,
    });

    return updated;
  }
}
