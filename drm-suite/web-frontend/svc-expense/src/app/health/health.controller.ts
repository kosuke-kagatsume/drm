import { Controller, Get, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense service is healthy',
      data: this.healthService.getHealthStatus(),
    };
  }

  @Get('detailed')
  getDetailedHealth() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Detailed health check',
      data: this.healthService.getDetailedHealthStatus(),
    };
  }
}
