import { Module } from '@nestjs/common';
import { PrismaModule } from '@drm-suite/prisma';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, CustomerModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
