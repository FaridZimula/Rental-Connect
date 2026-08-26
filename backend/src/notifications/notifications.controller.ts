import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  getAll(@CurrentUser() user: { id: string }) {
    return this.notifications.getUserNotifications(user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notifications.markRead(user.id, id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.notifications.markAllRead(user.id);
  }
}
