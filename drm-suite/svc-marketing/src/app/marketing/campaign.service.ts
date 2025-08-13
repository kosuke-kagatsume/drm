import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignFilterDto,
  CampaignMetricsDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: CampaignFilterDto) {
    const where: any = {};

    if (filter.companyId) where.companyId = filter.companyId;
    if (filter.storeId) where.storeId = filter.storeId;
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;

    if (filter.startDateFrom || filter.startDateTo) {
      where.startDate = {};
      if (filter.startDateFrom)
        where.startDate.gte = new Date(filter.startDateFrom);
      if (filter.startDateTo)
        where.startDate.lte = new Date(filter.startDateTo);
    }

    if (filter.endDateFrom || filter.endDateTo) {
      where.endDate = {};
      if (filter.endDateFrom) where.endDate.gte = new Date(filter.endDateFrom);
      if (filter.endDateTo) where.endDate.lte = new Date(filter.endDateTo);
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { type: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (filter.sortBy) {
      orderBy[filter.sortBy] = filter.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return this.prisma.campaign.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true, code: true } },
        leads: {
          select: {
            id: true,
            stage: true,
            name: true,
            email: true,
            phone: true,
            score: true,
            convertedAt: true,
          },
        },
        _count: {
          select: { leads: true },
        },
      },
      orderBy,
      take: 50,
      skip: 0,
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true, code: true } },
        leads: {
          select: {
            id: true,
            stage: true,
            name: true,
            email: true,
            phone: true,
            source: true,
            score: true,
            assignedTo: true,
            convertedAt: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('キャンペーンが見つかりません');
    }

    return campaign;
  }

  async create(createCampaignDto: CreateCampaignDto) {
    // Validate date range
    const startDate = new Date(createCampaignDto.startDate);
    const endDate = new Date(createCampaignDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('終了日は開始日より後である必要があります');
    }

    return this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        startDate,
        endDate,
        budgetPlanned: new Decimal(createCampaignDto.budgetPlanned),
      },
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true, code: true } },
        _count: {
          select: { leads: true },
        },
      },
    });
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    const campaign = await this.findOne(id);

    // Validate date range if dates are being updated
    if (updateCampaignDto.startDate || updateCampaignDto.endDate) {
      const startDate = updateCampaignDto.startDate
        ? new Date(updateCampaignDto.startDate)
        : campaign.startDate;
      const endDate = updateCampaignDto.endDate
        ? new Date(updateCampaignDto.endDate)
        : campaign.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException(
          '終了日は開始日より後である必要があります',
        );
      }
    }

    const updateData: any = { ...updateCampaignDto };

    if (updateCampaignDto.startDate) {
      updateData.startDate = new Date(updateCampaignDto.startDate);
    }
    if (updateCampaignDto.endDate) {
      updateData.endDate = new Date(updateCampaignDto.endDate);
    }
    if (updateCampaignDto.budgetPlanned) {
      updateData.budgetPlanned = new Decimal(updateCampaignDto.budgetPlanned);
    }
    if (updateCampaignDto.budgetActual) {
      updateData.budgetActual = new Decimal(updateCampaignDto.budgetActual);
    }

    return this.prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true, code: true } },
        leads: {
          select: {
            id: true,
            stage: true,
            name: true,
            email: true,
            phone: true,
            score: true,
            convertedAt: true,
          },
        },
        _count: {
          select: { leads: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    // Check if campaign has leads
    const leadsCount = await this.prisma.lead.count({
      where: { campaignId: id },
    });

    if (leadsCount > 0) {
      throw new BadRequestException(
        'リードが存在するキャンペーンは削除できません',
      );
    }

    return this.prisma.campaign.delete({ where: { id } });
  }

  async getMetrics(
    id: string,
  ): Promise<CampaignMetricsDto & { performance: any }> {
    const campaign = await this.findOne(id);

    // Get leads statistics
    const leadsStats = await this.prisma.lead.groupBy({
      by: ['stage'],
      where: { campaignId: id },
      _count: true,
    });

    const totalLeads = await this.prisma.lead.count({
      where: { campaignId: id },
    });

    const convertedLeads = await this.prisma.lead.count({
      where: {
        campaignId: id,
        stage: 'CONTRACT',
        convertedAt: { not: null },
      },
    });

    // Calculate basic metrics from campaign.metrics field
    const metrics = (campaign.metrics as any) || {};

    const impressions = metrics.impressions || 0;
    const clicks = metrics.clicks || 0;
    const cost = campaign.budgetActual?.toNumber() || 0;

    // Calculate derived metrics
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const cpa = convertedLeads > 0 ? cost / convertedLeads : 0;

    // Performance analysis
    const performance = {
      totalLeads,
      convertedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      leadsByStage: leadsStats.reduce(
        (acc, stat) => {
          acc[stat.stage] = stat._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      budgetUtilization:
        campaign.budgetPlanned.toNumber() > 0
          ? (cost / campaign.budgetPlanned.toNumber()) * 100
          : 0,
      daysRemaining: Math.max(
        0,
        Math.ceil(
          (campaign.endDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
      isActive: campaign.status === 'active',
    };

    return {
      campaignId: id,
      impressions,
      clicks,
      conversions: convertedLeads,
      leads: totalLeads,
      sales: convertedLeads, // Assuming CONTRACT stage means sale
      revenue: metrics.revenue || 0,
      cost,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      roas: cost > 0 && metrics.revenue ? metrics.revenue / cost : 0,
      customMetrics: metrics.customMetrics || {},
      performance,
    };
  }

  async updateMetrics(id: string, metrics: Partial<CampaignMetricsDto>) {
    const campaign = await this.findOne(id);
    const currentMetrics = (campaign.metrics as any) || {};

    const updatedMetrics = {
      ...currentMetrics,
      ...metrics,
      updatedAt: new Date().toISOString(),
    };

    return this.prisma.campaign.update({
      where: { id },
      data: {
        metrics: updatedMetrics,
        ...(metrics.cost && { budgetActual: new Decimal(metrics.cost) }),
      },
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true, code: true } },
        _count: {
          select: { leads: true },
        },
      },
    });
  }

  async getCampaignPerformanceReport(companyId: string, storeId?: string) {
    const where: any = { companyId };
    if (storeId) where.storeId = storeId;

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: {
        leads: {
          select: {
            id: true,
            stage: true,
            convertedAt: true,
          },
        },
        _count: {
          select: { leads: true },
        },
      },
    });

    return campaigns.map((campaign) => {
      const totalLeads = campaign._count.leads;
      const convertedLeads = campaign.leads.filter(
        (lead) => lead.stage === 'CONTRACT' && lead.convertedAt,
      ).length;

      const metrics = (campaign.metrics as any) || {};
      const cost = campaign.budgetActual?.toNumber() || 0;
      const conversionRate =
        totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budgetPlanned: campaign.budgetPlanned.toNumber(),
        budgetActual: cost,
        totalLeads,
        convertedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        cpa:
          convertedLeads > 0
            ? Math.round((cost / convertedLeads) * 100) / 100
            : 0,
        roi:
          cost > 0 && metrics.revenue
            ? Math.round(((metrics.revenue - cost) / cost) * 100) / 100
            : 0,
      };
    });
  }
}
