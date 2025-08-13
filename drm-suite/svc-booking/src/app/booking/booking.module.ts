import { Module } from '@nestjs/common';
import { PrismaModule } from '@drm-suite/prisma';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
