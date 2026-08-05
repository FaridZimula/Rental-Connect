import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { fuzzeLocation } from '../common/utils/location-fuzzer';
import { scrubContactInfo } from '../common/utils/contact-scrubber';

// Fields that MUST NEVER appear in any public-facing response
const PRIVATE_FIELDS = ['real_address', 'real_lat', 'real_lng'];

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreatePropertyDto) {
    const { real_lat, real_lng } = dto;
    const fuzzed = fuzzeLocation(real_lat, real_lng);

    // Scrub description before saving
    const safeDescription = scrubContactInfo(dto.description);

    // Ensure amenities exist (upsert by name)
    const amenityConnects = dto.amenities
      ? await Promise.all(
          dto.amenities.map((name) =>
            this.prisma.amenity.upsert({
              where: { name },
              create: { name },
              update: {},
            }),
          ),
        )
      : [];

    return this.prisma.property.create({
      data: {
        owner_id: ownerId,
        title: dto.title,
        description: safeDescription,
        property_type: dto.property_type as any,
        listing_type: dto.listing_type as any,
        price: dto.price,
        real_address: dto.real_address,
        display_zone: dto.display_zone,
        display_lat: fuzzed.lat,
        display_lng: fuzzed.lng,
        real_lat,
        real_lng,
        bedrooms: dto.bedrooms ?? 0,
        bathrooms: dto.bathrooms ?? 0,
        area_sqft: dto.area_sqft,
        amenities: {
          create: amenityConnects.map((a) => ({ amenity_id: a.id })),
        },
      },
      include: { images: true, amenities: { include: { amenity: true } } },
    });
  }

  async findAll(query: QueryPropertiesDto) {
    const { page = 1, limit = 20, zone, listing_type, property_type, price_min, price_max, bedrooms, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: 'published' };
    if (zone) where.display_zone = { contains: zone, mode: 'insensitive' };
    if (listing_type) where.listing_type = listing_type;
    if (property_type) where.property_type = property_type;
    if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };
    if (price_min !== undefined || price_max !== undefined) {
      where.price = {};
      if (price_min !== undefined) where.price.gte = price_min;
      if (price_max !== undefined) where.price.lte = price_max;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { display_zone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
        include: {
          images: { where: { is_primary: true }, take: 1 },
          amenities: { include: { amenity: true } },
          _count: { select: { leads: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties.map((p) => this.maskProperty(p)),
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id, status: 'published' },
      include: {
        images: true,
        amenities: { include: { amenity: true } },
        reviews: {
          include: { user: { select: { full_name: true } } },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return this.maskProperty(property);
  }

  async findOwnerProperties(ownerId: string) {
    const properties = await this.prisma.property.findMany({
      where: { owner_id: ownerId },
      include: { images: true, _count: { select: { leads: true } } },
      orderBy: { created_at: 'desc' },
    });
    // Owner can see their own real data (unmasked), but still no other owner's private info
    return properties;
  }

  async update(id: string, ownerId: string, dto: Partial<CreatePropertyDto>) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.owner_id !== ownerId) throw new ForbiddenException();

    const data: any = {};
    if (dto.title) data.title = dto.title;
    if (dto.description) data.description = scrubContactInfo(dto.description);
    if (dto.price) data.price = dto.price;
    if (dto.bedrooms !== undefined) data.bedrooms = dto.bedrooms;
    if (dto.bathrooms !== undefined) data.bathrooms = dto.bathrooms;
    if (dto.area_sqft !== undefined) data.area_sqft = dto.area_sqft;
    if (dto.display_zone) data.display_zone = dto.display_zone;
    if (dto.real_address) data.real_address = dto.real_address;
    if (dto.real_lat && dto.real_lng) {
      const fuzzed = fuzzeLocation(dto.real_lat, dto.real_lng);
      data.real_lat = dto.real_lat;
      data.real_lng = dto.real_lng;
      data.display_lat = fuzzed.lat;
      data.display_lng = fuzzed.lng;
    }

    // On edit, revert to pending_review for re-moderation
    if (Object.keys(data).length > 0) {
      data.status = 'pending_review';
    }

    return this.prisma.property.update({ where: { id }, data });
  }

  /**
   * Removes private fields from any property object before returning to clients.
   * This is the serialization-layer enforcement — API consumers cannot see private data.
   */
  maskProperty(property: any) {
    const masked = { ...property };
    for (const field of PRIVATE_FIELDS) {
      delete masked[field];
    }
    // Strip owner PII from any nested owner object
    if (masked.owner) {
      delete masked.owner.password_hash;
      delete masked.owner.email;
      delete masked.owner.phone;
    }
    return masked;
  }
}
