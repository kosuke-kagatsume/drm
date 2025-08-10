import { Module } from '@nestjs/common';
import { PrismaModule } from '@drm-suite/prisma';
import { EstimateModule } from './estimate/estimate.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, EstimateModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
