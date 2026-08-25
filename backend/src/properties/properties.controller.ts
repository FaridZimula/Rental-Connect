import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  /** Public: browse all published listings (masked) */
  @Get()
  findAll(@Query() query: QueryPropertiesDto) {
    return this.propertiesService.findAll(query);
  }

  /** Public: single published listing detail (masked) */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  /** Landlord: create a new listing (enters pending_review) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('landlord')
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.id, dto);
  }

  /** Landlord: view their own listings (includes private fields) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('landlord')
  @Get('owner/my')
  myProperties(@CurrentUser() user: { id: string }) {
    return this.propertiesService.findOwnerProperties(user.id);
  }

  /** Landlord: edit a listing (triggers re-moderation) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('landlord')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Partial<CreatePropertyDto>,
  ) {
    return this.propertiesService.update(id, user.id, dto);
  }

  /** Landlord: toggle availability (mark as rented/available) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('landlord')
  @Patch(':id/availability')
  toggleAvailability(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.propertiesService.toggleAvailability(id, user.id);
  }

  /** Landlord: delete a listing */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('landlord')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.propertiesService.remove(id, user.id);
  }
}
