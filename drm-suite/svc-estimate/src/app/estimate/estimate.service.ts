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
        status: createEstimateDto.status || 'draft',
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

  // RAG-based features
  async findSimilarEstimates(query: string, limit: number = 5) {
    // This would use vector search in a real implementation
    // For now, we'll use text-based similarity search
    const estimates = await this.prisma.estimate.findMany({
      where: {
        OR: [
          { customerName: { contains: query } },
          { propertyType: { contains: query } },
          { constructMethod: { contains: query } },
          { structure: { contains: query } },
          { notes: { contains: query } },
        ],
      },
      include: {
        items: true,
        costs: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return estimates.map((estimate) => ({
      id: estimate.id,
      projectName: `${estimate.propertyType} - ${estimate.constructMethod}`,
      customerName: estimate.customerName,
      totalAmount: estimate.totalAmount,
      createdAt: estimate.createdAt.toISOString(),
      similarity: 0.85, // Mock similarity score
      structure: estimate.structure,
      method: estimate.constructMethod,
      itemCount: (estimate as any).items?.length || 0,
    }));
  }

  async suggestItems(projectType: string, description: string) {
    // Find similar estimates based on project type
    const similarEstimates = await this.prisma.estimate.findMany({
      where: {
        OR: [
          { propertyType: { contains: projectType } },
          { constructMethod: { contains: projectType } },
        ],
      },
      include: {
        items: true,
      },
      take: 10,
    });

    // Aggregate common items
    const itemFrequency = new Map();

    similarEstimates.forEach((estimate) => {
      (estimate as any).items?.forEach((item: any) => {
        const key = `${item.category}-${item.name}`;
        if (!itemFrequency.has(key)) {
          itemFrequency.set(key, {
            ...item,
            frequency: 0,
            avgPrice: 0,
            minPrice: item.unitPrice,
            maxPrice: item.unitPrice,
            totalPrice: item.unitPrice,
          });
        }
        const existing = itemFrequency.get(key);
        existing.frequency += 1;
        existing.totalPrice = existing.totalPrice.add(item.unitPrice);
        existing.avgPrice = existing.totalPrice.div(existing.frequency);
        existing.minPrice = existing.minPrice.lt(item.unitPrice)
          ? existing.minPrice
          : item.unitPrice;
        existing.maxPrice = existing.maxPrice.gt(item.unitPrice)
          ? existing.maxPrice
          : item.unitPrice;
      });
    });

    // Return top suggested items
    return Array.from(itemFrequency.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20)
      .map((item) => ({
        category: item.category,
        itemName: item.name,
        specification: item.description,
        unit: item.unit,
        unitPrice: item.avgPrice,
        quantity: 1,
        frequency: item.frequency,
        priceRange: {
          min: item.minPrice,
          max: item.maxPrice,
          avg: item.avgPrice,
        },
        confidence: Math.min(item.frequency * 0.2, 1.0),
      }));
  }

  async optimizePricing(sections: any[]) {
    const optimizationSuggestions = [];

    for (const section of sections) {
      for (const item of section.items) {
        // Find market pricing for similar items
        const similarItems = await this.prisma.estimateItem.findMany({
          where: {
            category: item.category,
            name: { contains: item.itemName },
          },
          select: {
            unitPrice: true,
            totalPrice: true,
            quantity: true,
          },
          take: 50,
        });

        if (similarItems.length > 5) {
          const prices = similarItems.map((si) => Number(si.unitPrice));
          const avgPrice =
            prices.reduce((sum, price) => sum + price, 0) / prices.length;
          const medianPrice = prices.sort((a, b) => a - b)[
            Math.floor(prices.length / 2)
          ];

          const currentPrice = item.unitPrice;
          const priceDiff = ((currentPrice - avgPrice) / avgPrice) * 100;

          if (Math.abs(priceDiff) > 10) {
            optimizationSuggestions.push({
              sectionId: section.id,
              itemId: item.id,
              currentPrice,
              suggestedPrice: medianPrice,
              marketAverage: avgPrice,
              priceDifference: priceDiff,
              confidence: Math.min(similarItems.length / 20, 1.0),
              reason:
                priceDiff > 0
                  ? 'Price is above market average'
                  : 'Price is below market average',
              impact: Math.abs(currentPrice - medianPrice) * item.quantity,
            });
          }
        }
      }
    }

    return {
      suggestions: optimizationSuggestions,
      totalPotentialSaving: optimizationSuggestions
        .filter((s) => s.priceDifference > 0)
        .reduce((sum, s) => sum + s.impact, 0),
      totalPotentialIncrease: optimizationSuggestions
        .filter((s) => s.priceDifference < 0)
        .reduce((sum, s) => sum + Math.abs(s.impact), 0),
    };
  }

  async getEstimateStats(period?: string) {
    const dateFilter = period ? this.getDateFilter(period) : {};

    const [
      totalEstimates,
      statusBreakdown,
      avgAmount,
      totalAmount,
      conversionData,
    ] = await Promise.all([
      this.prisma.estimate.count({ where: dateFilter }),
      this.prisma.estimate.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true },
      }),
      this.prisma.estimate.aggregate({
        where: dateFilter,
        _avg: { totalAmount: true },
      }),
      this.prisma.estimate.aggregate({
        where: dateFilter,
        _sum: { totalAmount: true },
      }),
      this.prisma.estimate.findMany({
        where: { ...dateFilter, status: { in: ['approved', 'rejected'] } },
        select: { status: true },
      }),
    ]);

    const statusCount = statusBreakdown.reduce((acc: any, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    const approvedCount = conversionData.filter(
      (e) => e.status === 'approved',
    ).length;
    const totalDecided = conversionData.length;

    return {
      total: totalEstimates,
      byStatus: statusCount,
      financial: {
        totalValue: Number(totalAmount._sum.totalAmount || 0),
        averageValue: Number(avgAmount._avg.totalAmount || 0),
      },
      performance: {
        conversionRate:
          totalDecided > 0 ? (approvedCount / totalDecided) * 100 : 0,
      },
    };
  }

  private getDateFilter(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return {};
    }

    return {
      createdAt: {
        gte: startDate,
        lte: now,
      },
    };
  }
}
