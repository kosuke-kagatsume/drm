import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadFilterDto,
  LeadConversionDto,
} from './dto';

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: LeadFilterDto) {
    const where: any = {};

    if (filter.campaignId) where.campaignId = filter.campaignId;
    if (filter.stage) where.stage = filter.stage;
    if (filter.source) where.source = filter.source;
    if (filter.assignedTo) where.assignedTo = filter.assignedTo;

    if (filter.minScore !== undefined || filter.maxScore !== undefined) {
      where.score = {};
      if (filter.minScore !== undefined) where.score.gte = filter.minScore;
      if (filter.maxScore !== undefined) where.score.lte = filter.maxScore;
    }

    if (filter.createdFrom || filter.createdTo) {
      where.createdAt = {};
      if (filter.createdFrom)
        where.createdAt.gte = new Date(filter.createdFrom);
      if (filter.createdTo) where.createdAt.lte = new Date(filter.createdTo);
    }

    if (filter.convertedFrom || filter.convertedTo) {
      where.convertedAt = {};
      if (filter.convertedFrom)
        where.convertedAt.gte = new Date(filter.convertedFrom);
      if (filter.convertedTo)
        where.convertedAt.lte = new Date(filter.convertedTo);
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { phone: { contains: filter.search, mode: 'insensitive' } },
        { source: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (filter.sortBy) {
      orderBy[filter.sortBy] = filter.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy,
      take: 50,
      skip: 0,
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            companyId: true,
            storeId: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('リードが見つかりません');
    }

    return lead;
  }

  async create(createLeadDto: CreateLeadDto) {
    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createLeadDto.campaignId },
    });

    if (!campaign) {
      throw new BadRequestException('指定されたキャンペーンが見つかりません');
    }

    // Check for duplicate email in the same campaign
    if (createLeadDto.email) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          campaignId: createLeadDto.campaignId,
          email: createLeadDto.email,
        },
      });

      if (existingLead) {
        throw new BadRequestException(
          'このメールアドレスのリードは既に存在します',
        );
      }
    }

    return this.prisma.lead.create({
      data: createLeadDto,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await this.findOne(id);

    // Check for duplicate email if email is being updated
    if (updateLeadDto.email && updateLeadDto.email !== lead.email) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          campaignId: lead.campaignId,
          email: updateLeadDto.email,
          id: { not: id },
        },
      });

      if (existingLead) {
        throw new BadRequestException(
          'このメールアドレスのリードは既に存在します',
        );
      }
    }

    const updateData: any = { ...updateLeadDto };

    if (updateLeadDto.convertedAt) {
      updateData.convertedAt = new Date(updateLeadDto.convertedAt);
    }

    return this.prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.lead.delete({ where: { id } });
  }

  async convertLead(conversion: LeadConversionDto) {
    const lead = await this.findOne(conversion.leadId);

    // Validate stage progression
    const stageOrder = ['LEAD', 'VISIT', 'CONTRACT'];
    const currentStageIndex = stageOrder.indexOf(lead.stage);
    const targetStageIndex = stageOrder.indexOf(conversion.toStage);

    if (targetStageIndex <= currentStageIndex) {
      throw new BadRequestException('リードステージは前進する必要があります');
    }

    const updateData: any = {
      stage: conversion.toStage,
    };

    // If converting to CONTRACT, set conversion date
    if (conversion.toStage === 'CONTRACT') {
      updateData.convertedAt = new Date(conversion.convertedAt);
      updateData.score = Math.max(lead.score, 100); // Boost score for converted leads
    }

    // Update metadata with conversion data
    const metadata = (lead.metadata as any) || {};
    const conversions = metadata.conversions || [];
    conversions.push({
      fromStage: lead.stage,
      toStage: conversion.toStage,
      convertedAt: conversion.convertedAt,
      notes: conversion.notes,
      conversionData: conversion.conversionData,
    });
    updateData.metadata = { ...metadata, conversions };

    return this.prisma.lead.update({
      where: { id: conversion.leadId },
      data: updateData,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });
  }

  async getLeadTracking(id: string) {
    const lead = await this.findOne(id);
    const metadata = (lead.metadata as any) || {};

    return {
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        currentStage: lead.stage,
        score: lead.score,
        source: lead.source,
        assignedTo: lead.assignedTo,
        convertedAt: lead.convertedAt,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
      campaign: lead.campaign,
      conversions: metadata.conversions || [],
      timeline: this.generateLeadTimeline(lead, metadata.conversions || []),
    };
  }

  private generateLeadTimeline(lead: any, conversions: any[]) {
    const timeline = [
      {
        event: 'Lead Created',
        stage: 'LEAD',
        date: lead.createdAt,
        description: `リードが${lead.source}から作成されました`,
      },
    ];

    conversions.forEach((conversion) => {
      timeline.push({
        event: 'Stage Conversion',
        stage: conversion.toStage,
        date: conversion.convertedAt,
        description: `${conversion.fromStage}から${conversion.toStage}へ進行`,
        notes: conversion.notes,
      });
    });

    if (lead.convertedAt) {
      timeline.push({
        event: 'Final Conversion',
        stage: 'CONTRACT',
        date: lead.convertedAt,
        description: '最終コンバージョン達成',
      });
    }

    return timeline.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  async getConversionAnalytics(
    campaignId?: string,
    companyId?: string,
    storeId?: string,
  ) {
    const where: any = {};

    if (campaignId) {
      where.campaignId = campaignId;
    } else {
      // If no campaign specified, filter by company/store via campaign
      const campaignWhere: any = {};
      if (companyId) campaignWhere.companyId = companyId;
      if (storeId) campaignWhere.storeId = storeId;

      if (Object.keys(campaignWhere).length > 0) {
        where.campaign = campaignWhere;
      }
    }

    // Get lead statistics by stage
    const leadsByStage = await this.prisma.lead.groupBy({
      by: ['stage'],
      where,
      _count: true,
    });

    // Get conversion timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentConversions = await this.prisma.lead.findMany({
      where: {
        ...where,
        convertedAt: { gte: thirtyDaysAgo },
        stage: 'CONTRACT',
      },
      select: {
        convertedAt: true,
        campaign: {
          select: { name: true, type: true },
        },
      },
      orderBy: { convertedAt: 'asc' },
    });

    // Calculate conversion rates
    const totalLeads = leadsByStage.reduce(
      (sum, stage) => sum + stage._count,
      0,
    );
    const contractLeads =
      leadsByStage.find((stage) => stage.stage === 'CONTRACT')?._count || 0;
    const visitLeads =
      leadsByStage.find((stage) => stage.stage === 'VISIT')?._count || 0;

    const leadToVisitRate =
      totalLeads > 0 ? ((visitLeads + contractLeads) / totalLeads) * 100 : 0;
    const visitToContractRate =
      visitLeads + contractLeads > 0
        ? (contractLeads / (visitLeads + contractLeads)) * 100
        : 0;
    const overallConversionRate =
      totalLeads > 0 ? (contractLeads / totalLeads) * 100 : 0;

    // Get top sources
    const topSources = await this.prisma.lead.groupBy({
      by: ['source'],
      where,
      _count: true,
      orderBy: { _count: { _all: 'desc' } },
      take: 5,
    });

    return {
      summary: {
        totalLeads,
        contractLeads,
        overallConversionRate: Math.round(overallConversionRate * 100) / 100,
        leadToVisitRate: Math.round(leadToVisitRate * 100) / 100,
        visitToContractRate: Math.round(visitToContractRate * 100) / 100,
      },
      leadsByStage: leadsByStage.reduce(
        (acc, stage) => {
          acc[stage.stage] = stage._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      conversionTimeline: recentConversions.map((lead) => ({
        date: lead.convertedAt,
        campaign: lead.campaign?.name,
        campaignType: lead.campaign?.type,
      })),
      topSources: topSources.map((source) => ({
        source: source.source,
        count: source._count,
      })),
      funnel: {
        LEAD: leadsByStage.find((s) => s.stage === 'LEAD')?._count || 0,
        VISIT: leadsByStage.find((s) => s.stage === 'VISIT')?._count || 0,
        CONTRACT: contractLeads,
      },
    };
  }

  async scoreLeads(campaignId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { campaignId },
      include: {
        campaign: {
          select: { type: true, startDate: true },
        },
      },
    });

    const updates = leads.map(async (lead) => {
      let score = lead.score;
      const metadata = (lead.metadata as any) || {};

      // Scoring factors
      if (lead.email) score += 10;
      if (lead.phone) score += 10;
      if (lead.assignedTo) score += 5;

      // Time-based scoring (newer leads get higher scores)
      const daysSinceCreated = Math.floor(
        (new Date().getTime() - new Date(lead.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysSinceCreated <= 7) score += 15;
      else if (daysSinceCreated <= 30) score += 10;

      // Source-based scoring
      const sourceScores: Record<string, number> = {
        referral: 20,
        website: 15,
        social: 10,
        email: 8,
        advertising: 5,
      };
      score += sourceScores[lead.source.toLowerCase()] || 0;

      // Stage-based scoring
      const stageScores: Record<string, number> = {
        LEAD: 0,
        VISIT: 25,
        CONTRACT: 50,
      };
      score += stageScores[lead.stage] || 0;

      // Activity-based scoring (from metadata)
      if (metadata.emailOpened) score += 5;
      if (metadata.emailClicked) score += 10;
      if (metadata.phoneContacted) score += 15;
      if (metadata.meetingScheduled) score += 20;

      // Cap score at 100
      score = Math.min(score, 100);

      return this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          score,
          metadata: {
            ...metadata,
            lastScored: new Date().toISOString(),
          },
        },
      });
    });

    await Promise.all(updates);

    return { message: `${leads.length}件のリードのスコアを更新しました` };
  }
}
