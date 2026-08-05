import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  /** Buyer: submit a connection request */
  @UseGuards(RolesGuard)
  @Roles('buyer')
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(user.id, dto);
  }

  /** Buyer: spend a credit to unlock contact info */
  @UseGuards(RolesGuard)
  @Roles('buyer')
  @Post(':id/unlock')
  unlock(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.leadsService.unlockWithCredit(id, user.id);
  }

  /** Buyer or Owner: get lead detail (contact info only if unlocked) */
  @Get(':id')
  getLead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.leadsService.getUnlockedLead(id, user.id);
  }

  /** Buyer: view all their connection requests */
  @UseGuards(RolesGuard)
  @Roles('buyer')
  @Get('buyer/my')
  myLeads(@CurrentUser() user: { id: string }) {
    return this.leadsService.getBuyerLeads(user.id);
  }

  /** Owner: view all incoming unlocked leads */
  @UseGuards(RolesGuard)
  @Roles('owner')
  @Get('owner/incoming')
  incomingLeads(@CurrentUser() user: { id: string }) {
    return this.leadsService.getOwnerLeads(user.id);
  }
}
