import {
  Controller,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseBoolPipe,
  Optional,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
@Controller('properties/:propertyId/images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Query('primary') primary?: string,
  ) {
    return this.imagesService.uploadPropertyImage(
      propertyId,
      user.id,
      file,
      primary === 'true',
    );
  }

  @Delete(':imageId')
  delete(@Param('imageId') imageId: string, @CurrentUser() user: { id: string }) {
    return this.imagesService.deleteImage(imageId, user.id);
  }
}
