import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CreditsModule } from '../credits/credits.module';
import { FeaturedModule } from '../featured/featured.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CreditsModule, FeaturedModule, NotificationsModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
