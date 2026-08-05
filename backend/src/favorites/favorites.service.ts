import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, propertyId: string) {
    return this.prisma.favorite.upsert({
      where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
      create: { user_id: userId, property_id: propertyId },
      update: {},
    });
  }

  async remove(userId: string, propertyId: string) {
    return this.prisma.favorite.deleteMany({
      where: { user_id: userId, property_id: propertyId },
    });
  }

  async getUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { user_id: userId },
      include: {
        property: {
          include: { images: { where: { is_primary: true }, take: 1 } },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
