import { Module } from '@nestjs/common';
import { FeaturedService } from './featured.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [FeaturedService],
  exports: [FeaturedService],
})
export class FeaturedModule {}
