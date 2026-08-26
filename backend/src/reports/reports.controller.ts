import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto, ResolveReportDto } from './dto/report.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.id, dto);
  }

  @Get('my-reports')
  myReports(@CurrentUser() user: { id: string }) {
    return this.reportsService.findUserReports(user.id);
  }

  @Roles('admin')
  @Get('admin/all')
  adminAllReports(@Query('status') status?: string) {
    return this.reportsService.findAllReportsForAdmin(status);
  }

  @Roles('admin')
  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ResolveReportDto,
  ) {
    return this.reportsService.resolveReport(id, user.id, dto);
  }
}
