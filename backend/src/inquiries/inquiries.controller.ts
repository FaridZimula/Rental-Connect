import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, RespondInquiryDto } from './dto/inquiry.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('inquiries')
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  @Roles('tenant')
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(user.id, dto);
  }

  @Roles('tenant')
  @Get('my-inquiries')
  myInquiries(@CurrentUser() user: { id: string }) {
    return this.inquiriesService.findTenantInquiries(user.id);
  }

  @Roles('landlord')
  @Get('landlord-inquiries')
  landlordInquiries(@CurrentUser() user: { id: string }) {
    return this.inquiriesService.findLandlordInquiries(user.id);
  }

  @Roles('landlord')
  @Patch(':id/respond')
  respond(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RespondInquiryDto,
  ) {
    return this.inquiriesService.respond(id, user.id, dto);
  }
}
