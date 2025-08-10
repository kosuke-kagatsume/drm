import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Multi-tenant helper methods
  forCompany(companyId: string) {
    return {
      estimate: this.estimate.findMany({ where: { companyId } }),
      inventory: this.inventory.findMany({ where: { companyId } }),
      campaign: this.campaign.findMany({ where: { companyId } }),
      booking: this.booking.findMany({ where: { companyId } }),
    };
  }
}
