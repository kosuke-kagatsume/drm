import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: bigint) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  async findAllUsers(companyId: bigint) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }
}