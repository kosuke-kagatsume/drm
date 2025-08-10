import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { CreateEstimateDto, UpdateEstimateDto, EstimateFilterDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class EstimateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: EstimateFilterDto) {
    const where: any = {};

    if (filter.companyId) where.companyId = filter.companyId;
    if (filter.storeId) where.storeId = filter.storeId;
    if (filter.staffId) where.userId = filter.staffId;
    if (filter.status) where.status = filter.status;
    if (filter.propertyType) where.propertyType = filter.propertyType;
    if (filter.method) where.constructMethod = filter.method;
    if (filter.structure) where.structure = filter.structure;

    if (filter.priceRange) {
      const [min, max] = filter.priceRange.split('-').map(Number);
      where.totalAmount = {
        gte: new Decimal(min),
        lte: new Decimal(max),
      };
    }

    if (filter.location) {
      where.location = {
        path: ['address'],
        string_contains: filter.location,
      };
    }

    return this.prisma.estimate.findMany({
      where,
      include: {
        items: true,
        costs: true,
        contractors: true,
        approvals: true,
        user: { select: { name: true, email: true } },
        store: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit || 50,
      skip: filter.offset || 0,
    });
  }

  async findOne(id: string) {
    const estimate = await this.prisma.estimate.findUnique({
      where: { id },
      include: {
        items: true,
        costs: true,
        contractors: true,
        approvals: { orderBy: { stage: 'asc' } },
        user: { select: { name: true, email: true } },
        store: { select: { name: true, code: true } },
      },
    });

    if (!estimate) {
      throw new NotFoundException('見積が見つかりません');
    }

    return estimate;
  }

  async create(createEstimateDto: CreateEstimateDto) {
    const { items, costs, contractors, ...estimateData } = createEstimateDto;

    return this.prisma.estimate.create({
      data: {
        ...estimateData,
        items: items ? { create: items } : undefined,
        costs: costs ? { create: costs } : undefined,
        contractors: contractors ? { create: contractors } : undefined,
      },
      include: {
        items: true,
        costs: true,
        contractors: true,
      },
    });
  }

  async update(id: string, updateEstimateDto: UpdateEstimateDto) {
    const estimate = await this.findOne(id);

    const { items, costs, contractors, ...estimateData } = updateEstimateDto;

    return this.prisma.estimate.update({
      where: { id },
      data: {
        ...estimateData,
        version: estimate.version + 1,
      },
      include: {
        items: true,
        costs: true,
        contractors: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.estimate.delete({ where: { id } });
  }

  async copy(id: string, mode: 'FULL' | 'ITEM') {
    const original = await this.findOne(id);

    const copyData: any = {
      companyId: original.companyId,
      storeId: original.storeId,
      userId: original.userId,
      estimateNumber: `${original.estimateNumber}-copy-${Date.now()}`,
      status: 'draft',
      customerName: original.customerName,
      customerEmail: original.customerEmail,
      customerPhone: original.customerPhone,
      propertyType: original.propertyType,
      constructMethod: original.constructMethod,
      structure: original.structure,
      location: original.location,
      totalAmount: original.totalAmount,
      taxAmount: original.taxAmount,
      discountAmount: original.discountAmount,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: original.notes,
    };

    if (mode === 'FULL') {
      copyData.items = { create: original.items };
      copyData.costs = { create: original.costs };
      copyData.contractors = { create: original.contractors };
    } else if (mode === 'ITEM') {
      copyData.items = { create: original.items };
    }

    return this.prisma.estimate.create({
      data: copyData,
      include: {
        items: true,
        costs: true,
        contractors: true,
      },
    });
  }

  async approve(id: string, approvalData: any) {
    const estimate = await this.findOne(id);

    if (!estimate.approvalFlow) {
      throw new BadRequestException('承認フローが設定されていません');
    }

    // Simple approval logic - can be extended
    return this.prisma.estimate.update({
      where: { id },
      data: {
        status: 'approved',
        approvals: {
          create: {
            stage: 1,
            approverEmail: approvalData.approverEmail,
            status: 'approved',
            comments: approvalData.comments,
            approvedAt: new Date(),
          },
        },
      },
    });
  }

  async getApprovalWorkflow(id: string) {
    const estimate = await this.findOne(id);
    return {
      workflow: estimate.approvalFlow,
      approvals: estimate.approvals,
    };
  }
}
