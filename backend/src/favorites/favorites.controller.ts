import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  getAll(@CurrentUser() user: { id: string }) {
    return this.favoritesService.getUserFavorites(user.id);
  }

  @Post(':propertyId')
  add(@Param('propertyId') propertyId: string, @CurrentUser() user: { id: string }) {
    return this.favoritesService.add(user.id, propertyId);
  }

  @Delete(':propertyId')
  remove(@Param('propertyId') propertyId: string, @CurrentUser() user: { id: string }) {
    return this.favoritesService.remove(user.id, propertyId);
  }
}
