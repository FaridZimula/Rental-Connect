import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { AdminModule } from './admin/admin.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ImagesModule } from './images/images.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PropertiesModule,
    AdminModule,
    FavoritesModule,
    ImagesModule,
    NotificationsModule,
    InquiriesModule,
    ReportsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
