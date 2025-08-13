import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealthStatus() {
    return {
      service: 'svc-expense',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getDetailedHealthStatus() {
    return {
      service: 'svc-expense',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      modules: {
        expenseManagement: 'healthy',
        categoryManagement: 'healthy',
        approvalWorkflow: 'healthy',
        budgetManagement: 'healthy',
        reportGeneration: 'healthy',
        attachmentManagement: 'healthy',
        paymentMethodManagement: 'healthy',
      },
      dependencies: {
        database: 'healthy',
        prisma: 'healthy',
      },
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
        external:
          Math.round((process.memoryUsage().external / 1024 / 1024) * 100) /
          100,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }
}
