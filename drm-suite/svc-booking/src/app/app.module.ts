import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingModule } from './booking/booking.module';
import { PrismaModule } from '@drm-suite/prisma';

@Module({
  imports: [PrismaModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
