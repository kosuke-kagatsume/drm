import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper for soft delete
  excludeDeleted<T, K>(model: T, keys: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(model).filter(([key]) => !keys.includes(key as K))
    ) as Omit<T, K>;
  }
}