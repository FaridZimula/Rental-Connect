import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const WATERMARK_TEXT = 'RentalConnect';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadPropertyImage(
    propertyId: string,
    ownerId: string,
    file: Express.Multer.File,
    isPrimary = false,
  ) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.owner_id !== ownerId) {
      throw new BadRequestException('Property not found or access denied');
    }

    // Upload to Cloudinary with a text watermark overlay
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `rental-connect/properties/${propertyId}`,
            transformation: [
              { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
              {
                overlay: {
                  font_family: 'Arial',
                  font_size: 40,
                  font_weight: 'bold',
                  text: WATERMARK_TEXT,
                },
                color: '#FFFFFF',
                opacity: 50,
                gravity: 'south_east',
                x: 20,
                y: 20,
              },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(file.buffer);
    });

    // If this is the first image or isPrimary, un-set current primary
    if (isPrimary) {
      await this.prisma.propertyImage.updateMany({
        where: { property_id: propertyId, is_primary: true },
        data: { is_primary: false },
      });
    }

    return this.prisma.propertyImage.create({
      data: {
        property_id: propertyId,
        image_url: uploadResult.secure_url,
        is_primary: isPrimary,
      },
    });
  }

  async deleteImage(imageId: string, ownerId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });
    if (!image || image.property.owner_id !== ownerId) {
      throw new BadRequestException('Image not found or access denied');
    }

    // Extract Cloudinary public_id from URL and delete from Cloudinary
    const urlParts = image.image_url.split('/');
    const publicId = urlParts.slice(-2).join('/').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId).catch(() => null);

    return this.prisma.propertyImage.delete({ where: { id: imageId } });
  }
}
