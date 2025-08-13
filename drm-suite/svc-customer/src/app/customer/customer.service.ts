import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilterDto,
  CreateInteractionDto,
} from './dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: CustomerFilterDto) {
    const where: any = {};

    // Basic filters
    if (filter.companyId) where.companyId = filter.companyId;
    if (filter.storeId) where.storeId = filter.storeId;
    if (filter.assignee) where.assignee = filter.assignee;
    if (filter.industry) where.industry = filter.industry;
    if (filter.leadSource) where.leadSource = filter.leadSource;

    // Array filters
    if (filter.status && filter.status.length > 0) {
      where.status = { in: filter.status };
    }
    if (filter.tags && filter.tags.length > 0) {
      where.tags = {
        array_contains: filter.tags,
      };
    }

    // Range filters
    if (filter.priorityMin || filter.priorityMax) {
      where.priority = {};
      if (filter.priorityMin) where.priority.gte = filter.priorityMin;
      if (filter.priorityMax) where.priority.lte = filter.priorityMax;
    }

    if (filter.lifeTimeValueMin || filter.lifeTimeValueMax) {
      where.lifeTimeValue = {};
      if (filter.lifeTimeValueMin)
        where.lifeTimeValue.gte = filter.lifeTimeValueMin;
      if (filter.lifeTimeValueMax)
        where.lifeTimeValue.lte = filter.lifeTimeValueMax;
    }

    // Date filters
    if (filter.createdFrom || filter.createdTo) {
      where.createdAt = {};
      if (filter.createdFrom)
        where.createdAt.gte = new Date(filter.createdFrom);
      if (filter.createdTo) where.createdAt.lte = new Date(filter.createdTo);
    }

    if (filter.lastContactFrom || filter.lastContactTo) {
      where.lastContact = {};
      if (filter.lastContactFrom)
        where.lastContact.gte = new Date(filter.lastContactFrom);
      if (filter.lastContactTo)
        where.lastContact.lte = new Date(filter.lastContactTo);
    }

    // Text search
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { companyName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const orderBy: any = {};
    if (filter.sortBy) {
      orderBy[filter.sortBy] = filter.sortOrder || 'asc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 5, // Latest 5 interactions
          },
          estimates: true,
        },
        orderBy,
        take: filter.limit || 50,
        skip: filter.offset || 0,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      customers,
      total,
      hasMore: (filter.offset || 0) + customers.length < total,
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
        estimates: {
          orderBy: { createdAt: 'desc' },
        },
        store: {
          select: { name: true, code: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('顧客が見つかりません');
    }

    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto) {
    // Generate customer number
    const customerNumber = await this.generateCustomerNumber(
      createCustomerDto.companyId,
    );

    const customerData = {
      ...createCustomerDto,
      customerNumber,
      tags: JSON.stringify(createCustomerDto.tags || []),
      communicationHistory: JSON.stringify(
        createCustomerDto.communicationHistory || [],
      ),
      metadata: JSON.stringify(createCustomerDto.metadata || {}),
    };

    return this.prisma.customer.create({
      data: customerData,
      include: {
        interactions: true,
        estimates: true,
      },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    const updateData: any = { ...updateCustomerDto };
    delete updateData.id;

    // Convert arrays and objects to JSON strings
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    if (updateData.communicationHistory) {
      updateData.communicationHistory = JSON.stringify(
        updateData.communicationHistory,
      );
    }
    if (updateData.metadata) {
      updateData.metadata = JSON.stringify(updateData.metadata);
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        estimates: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.customer.delete({ where: { id } });
  }

  async addInteraction(createInteractionDto: CreateInteractionDto) {
    const interaction = await this.prisma.customerInteraction.create({
      data: {
        ...createInteractionDto,
        metadata: JSON.stringify(createInteractionDto.metadata || {}),
      },
    });

    // Update customer's lastContact
    await this.prisma.customer.update({
      where: { id: createInteractionDto.customerId },
      data: { lastContact: new Date() },
    });

    return interaction;
  }

  async getInteractions(customerId: string, limit = 50, offset = 0) {
    return this.prisma.customerInteraction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getStats(companyId: string, storeId?: string) {
    const where: any = { companyId };
    if (storeId) where.storeId = storeId;

    const [total, byStatus, totalValue, avgValue, recentActivity] =
      await Promise.all([
        this.prisma.customer.count({ where }),
        this.prisma.customer.groupBy({
          by: ['status'],
          where,
          _count: { status: true },
        }),
        this.prisma.customer.aggregate({
          where,
          _sum: { lifeTimeValue: true },
        }),
        this.prisma.customer.aggregate({
          where,
          _avg: { lifeTimeValue: true },
        }),
        this.prisma.customerInteraction.count({
          where: {
            customer: where,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

    const statusCount = byStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      byStatus: statusCount,
      totalValue: totalValue._sum.lifeTimeValue || 0,
      averageValue: avgValue._avg.lifeTimeValue || 0,
      recentActivity,
      performance: {
        conversionRate: this.calculateConversionRate(statusCount),
        activeCustomers: statusCount.customer || 0,
        prospects: statusCount.prospect || 0,
        leads: statusCount.lead || 0,
      },
    };
  }

  async importCustomers(
    companyId: string,
    customers: any[],
    createdBy: string,
  ) {
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const customerData of customers) {
      try {
        // Check if customer exists by email
        const existingCustomer = await this.prisma.customer.findFirst({
          where: {
            companyId,
            email: customerData.email,
          },
        });

        if (existingCustomer) {
          // Update existing customer
          await this.update(existingCustomer.id, {
            ...customerData,
            id: existingCustomer.id,
          });
          results.updated++;
        } else {
          // Create new customer
          await this.create({
            ...customerData,
            companyId,
            createdBy,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push(
          `Failed to process ${customerData.name || customerData.email}: ${error.message}`,
        );
      }
    }

    return results;
  }

  async exportCustomers(companyId: string, format: 'csv' | 'json' = 'csv') {
    const customers = await this.prisma.customer.findMany({
      where: { companyId },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (format === 'json') {
      return customers;
    }

    // CSV format
    const headers = [
      'ID',
      'Customer Number',
      'Name',
      'Company',
      'Email',
      'Phone',
      'Status',
      'Priority',
      'Life Time Value',
      'Last Contact',
      'Assignee',
      'Created At',
    ];

    const csvRows = customers.map((customer) => [
      customer.id,
      customer.customerNumber,
      customer.name,
      customer.companyName || '',
      customer.email,
      customer.phone || '',
      customer.status,
      customer.priority,
      customer.lifeTimeValue.toString(),
      customer.lastContact?.toISOString() || '',
      customer.assignee || '',
      customer.createdAt.toISOString(),
    ]);

    return [headers, ...csvRows];
  }

  private async generateCustomerNumber(companyId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Find the last customer number for this month
    const lastCustomer = await this.prisma.customer.findFirst({
      where: {
        companyId,
        customerNumber: {
          startsWith: `${year}${month}`,
        },
      },
      orderBy: {
        customerNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastCustomer) {
      const lastSequence = parseInt(lastCustomer.customerNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${year}${month}${String(sequence).padStart(4, '0')}`;
  }

  private calculateConversionRate(statusCount: Record<string, number>): number {
    const total = Object.values(statusCount).reduce(
      (sum, count) => sum + count,
      0,
    );
    const converted = statusCount.customer || 0;
    return total > 0 ? (converted / total) * 100 : 0;
  }
}
