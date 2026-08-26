import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('properties/pending')
  getPending() {
    return this.adminService.getPendingListings();
  }

  @Post('properties/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() admin: { id: string }) {
    return this.adminService.approveProperty(id, admin.id);
  }

  @Post('properties/:id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.rejectProperty(id, reason, admin.id);
  }

  @Post('properties/:id/suspend')
  suspend(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.suspendProperty(id, reason, admin.id);
  }

  @Patch('users/:id/toggle-active')
  toggleUserActive(@Param('id') id: string, @CurrentUser() admin: { id: string }) {
    return this.adminService.toggleUserActive(id, admin.id);
  }

  @Get('analytics')
  analytics() {
    return this.adminService.getAnalytics();
  }

  @Get('users')
  users(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.adminService.getAllUsers(Number(page), Number(limit));
  }

  @Get('audit-logs')
  auditLogs(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.adminService.getAuditLogs(Number(page), Number(limit));
  }
}
