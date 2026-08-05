import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('properties/pending')
  getPending() {
    return this.adminService.getPendingListings();
  }

  @Post('properties/:id/approve')
  approve(@Param('id') id: string) {
    return this.adminService.approveProperty(id);
  }

  @Post('properties/:id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.rejectProperty(id, reason);
  }

  @Post('properties/:id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.suspendProperty(id, reason);
  }

  @Get('analytics')
  analytics() {
    return this.adminService.getAnalytics();
  }

  @Get('users')
  users(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.adminService.getAllUsers(Number(page), Number(limit));
  }
}
