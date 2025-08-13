import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  ExpenseReportRequestDto,
  ReportPeriodType,
  ReportFormat,
  ExpenseStatus,
} from './dto';

@Injectable()
export class ExpenseReportService {
  constructor(private prisma: PrismaService) {}

  async generateExpenseReport(request: ExpenseReportRequestDto) {
    const { startDate, endDate } = this.getReportPeriodDates(request);

    const baseWhere: Prisma.ExpenseWhereInput = {
      companyId: request.companyId,
      expenseDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (request.storeId) {
      baseWhere.storeId = request.storeId;
    }

    if (request.categoryId) {
      baseWhere.categoryId = request.categoryId;
    }

    if (request.userId) {
      baseWhere.userId = request.userId;
    }

    switch (request.format) {
      case ReportFormat.SUMMARY:
        return this.generateSummaryReport(baseWhere, request);
      case ReportFormat.DETAILED:
        return this.generateDetailedReport(baseWhere, request);
      case ReportFormat.COMPARISON:
        return this.generateComparisonReport(baseWhere, request);
      default:
        return this.generateSummaryReport(baseWhere, request);
    }
  }

  private async generateSummaryReport(
    where: Prisma.ExpenseWhereInput,
    request: ExpenseReportRequestDto,
  ) {
    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        category: {
          include: {
            parent: {
              select: { id: true, name: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    });

    const summary = {
      reportInfo: {
        generatedAt: new Date(),
        periodType: request.periodType,
        startDate: this.getReportPeriodDates(request).startDate,
        endDate: this.getReportPeriodDates(request).endDate,
        format: request.format || ReportFormat.SUMMARY,
        filters: {
          companyId: request.companyId,
          storeId: request.storeId,
          categoryId: request.categoryId,
          userId: request.userId,
        },
      },
      totals: {
        totalAmount: expenses.reduce(
          (sum, exp) => sum + exp.amount.toNumber(),
          0,
        ),
        totalCount: expenses.length,
        averageAmount:
          expenses.length > 0
            ? expenses.reduce((sum, exp) => sum + exp.amount.toNumber(), 0) /
              expenses.length
            : 0,
        currency: expenses.length > 0 ? expenses[0].currency : 'JPY',
      },
      byStatus: this.groupExpensesByStatus(expenses),
      byCategory: this.groupExpensesByCategory(expenses),
      byUser: this.groupExpensesByUser(expenses),
      byStore: request.storeId ? null : this.groupExpensesByStore(expenses),
      monthlyTrend: this.generateMonthlyTrend(expenses),
      topExpenses: expenses
        .sort((a, b) => b.amount.toNumber() - a.amount.toNumber())
        .slice(0, 10)
        .map((exp) => ({
          id: exp.id,
          title: exp.title,
          amount: exp.amount.toNumber(),
          category: exp.category.name,
          user: exp.user.name,
          date: exp.expenseDate,
          status: exp.status,
        })),
    };

    return summary;
  }

  private async generateDetailedReport(
    where: Prisma.ExpenseWhereInput,
    request: ExpenseReportRequestDto,
  ) {
    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        category: {
          include: {
            parent: {
              select: { id: true, name: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { id: true, name: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
        attachments: {
          select: { id: true, fileName: true, fileType: true, fileSize: true },
        },
        approvalHistory: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { expenseDate: 'desc' },
    });

    const summary = await this.generateSummaryReport(where, request);

    return {
      ...summary,
      reportInfo: {
        ...summary.reportInfo,
        format: ReportFormat.DETAILED,
      },
      expenses: expenses.map((exp) => ({
        id: exp.id,
        title: exp.title,
        description: exp.description,
        amount: exp.amount.toNumber(),
        currency: exp.currency,
        expenseDate: exp.expenseDate,
        status: exp.status,
        category: {
          id: exp.category.id,
          name: exp.category.name,
          parent: exp.category.parent?.name,
        },
        user: exp.user,
        store: exp.store,
        approver: exp.approver,
        approvedAt: exp.approvedAt,
        paidAt: exp.paidAt,
        attachmentCount: exp.attachments.length,
        attachments: exp.attachments,
        approvalHistory: exp.approvalHistory,
        metadata: exp.metadata,
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt,
      })),
    };
  }

  private async generateComparisonReport(
    where: Prisma.ExpenseWhereInput,
    request: ExpenseReportRequestDto,
  ) {
    const currentPeriodExpenses = await this.prisma.expense.findMany({
      where,
      include: {
        category: true,
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Get comparison period data
    const comparisonPeriod = this.getComparisonPeriod(request);
    const comparisonWhere = {
      ...where,
      expenseDate: {
        gte: comparisonPeriod.startDate,
        lte: comparisonPeriod.endDate,
      },
    };

    const comparisonExpenses = await this.prisma.expense.findMany({
      where: comparisonWhere,
      include: {
        category: true,
        user: {
          select: { id: true, name: true },
        },
      },
    });

    const currentSummary = {
      totalAmount: currentPeriodExpenses.reduce(
        (sum, exp) => sum + exp.amount.toNumber(),
        0,
      ),
      totalCount: currentPeriodExpenses.length,
      byCategory: this.groupExpensesByCategory(currentPeriodExpenses),
      byUser: this.groupExpensesByUser(currentPeriodExpenses),
      byStatus: this.groupExpensesByStatus(currentPeriodExpenses),
    };

    const comparisonSummary = {
      totalAmount: comparisonExpenses.reduce(
        (sum, exp) => sum + exp.amount.toNumber(),
        0,
      ),
      totalCount: comparisonExpenses.length,
      byCategory: this.groupExpensesByCategory(comparisonExpenses),
      byUser: this.groupExpensesByUser(comparisonExpenses),
      byStatus: this.groupExpensesByStatus(comparisonExpenses),
    };

    const changes = {
      totalAmount: {
        current: currentSummary.totalAmount,
        previous: comparisonSummary.totalAmount,
        change: currentSummary.totalAmount - comparisonSummary.totalAmount,
        changePercentage:
          comparisonSummary.totalAmount > 0
            ? ((currentSummary.totalAmount - comparisonSummary.totalAmount) /
                comparisonSummary.totalAmount) *
              100
            : 0,
      },
      totalCount: {
        current: currentSummary.totalCount,
        previous: comparisonSummary.totalCount,
        change: currentSummary.totalCount - comparisonSummary.totalCount,
        changePercentage:
          comparisonSummary.totalCount > 0
            ? ((currentSummary.totalCount - comparisonSummary.totalCount) /
                comparisonSummary.totalCount) *
              100
            : 0,
      },
    };

    return {
      reportInfo: {
        generatedAt: new Date(),
        periodType: request.periodType,
        currentPeriod: {
          startDate: this.getReportPeriodDates(request).startDate,
          endDate: this.getReportPeriodDates(request).endDate,
        },
        comparisonPeriod: {
          startDate: comparisonPeriod.startDate,
          endDate: comparisonPeriod.endDate,
        },
        format: ReportFormat.COMPARISON,
      },
      current: currentSummary,
      comparison: comparisonSummary,
      changes,
      categoryComparison: this.generateCategoryComparison(
        currentSummary.byCategory,
        comparisonSummary.byCategory,
      ),
      userComparison: this.generateUserComparison(
        currentSummary.byUser,
        comparisonSummary.byUser,
      ),
    };
  }

  async generateExpenseAnalytics(companyId: string, period?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    const expenses = await this.prisma.expense.findMany({
      where: {
        companyId,
        expenseDate: { gte: startDate },
        status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] },
      },
      include: {
        category: {
          include: { parent: true },
        },
        user: {
          select: { id: true, name: true },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      period: period || 'current_year',
      startDate,
      endDate: now,
      analytics: {
        spendingVelocity: this.calculateSpendingVelocity(expenses),
        seasonality: this.analyzeSeasonality(expenses),
        categoryTrends: this.analyzeCategoryTrends(expenses),
        userSpendingPatterns: this.analyzeUserSpendingPatterns(expenses),
        approvalMetrics: await this.getApprovalMetrics(companyId, startDate),
        budgetPerformance: await this.getBudgetPerformanceMetrics(
          companyId,
          period || 'current_year',
        ),
      },
    };
  }

  private getReportPeriodDates(request: ExpenseReportRequestDto): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();

    if (request.periodType === ReportPeriodType.CUSTOM) {
      if (!request.startDate || !request.endDate) {
        throw new BadRequestException(
          'Custom period requires startDate and endDate',
        );
      }
      return {
        startDate: new Date(request.startDate),
        endDate: new Date(request.endDate),
      };
    }

    switch (request.periodType) {
      case ReportPeriodType.MONTHLY:
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      case ReportPeriodType.QUARTERLY:
        const quarter = Math.floor(now.getMonth() / 3);
        return {
          startDate: new Date(now.getFullYear(), quarter * 3, 1),
          endDate: new Date(now.getFullYear(), quarter * 3 + 3, 0),
        };
      case ReportPeriodType.YEARLY:
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31),
        };
      default:
        throw new BadRequestException('Invalid period type');
    }
  }

  private getComparisonPeriod(request: ExpenseReportRequestDto): {
    startDate: Date;
    endDate: Date;
  } {
    if (request.compareWith) {
      // Parse comparison period string (e.g., "previous_month", "same_period_last_year")
      const current = this.getReportPeriodDates(request);
      const daysDiff = current.endDate.getTime() - current.startDate.getTime();

      return {
        startDate: new Date(current.startDate.getTime() - daysDiff - 86400000), // Previous period
        endDate: new Date(current.startDate.getTime() - 86400000),
      };
    }

    // Default to previous period
    const current = this.getReportPeriodDates(request);
    const daysDiff = current.endDate.getTime() - current.startDate.getTime();

    return {
      startDate: new Date(current.startDate.getTime() - daysDiff - 86400000),
      endDate: new Date(current.startDate.getTime() - 86400000),
    };
  }

  private groupExpensesByStatus(expenses: any[]) {
    const groups: Record<
      string,
      { count: number; amount: number; percentage: number }
    > = {};
    const total = expenses.reduce((sum, exp) => sum + exp.amount.toNumber(), 0);

    expenses.forEach((expense) => {
      if (!groups[expense.status]) {
        groups[expense.status] = { count: 0, amount: 0, percentage: 0 };
      }
      groups[expense.status].count++;
      groups[expense.status].amount += expense.amount.toNumber();
    });

    Object.keys(groups).forEach((status) => {
      groups[status].percentage =
        total > 0 ? (groups[status].amount / total) * 100 : 0;
    });

    return groups;
  }

  private groupExpensesByCategory(expenses: any[]) {
    const groups: Record<
      string,
      { count: number; amount: number; percentage: number }
    > = {};
    const total = expenses.reduce((sum, exp) => sum + exp.amount.toNumber(), 0);

    expenses.forEach((expense) => {
      const categoryName = expense.category.name;
      if (!groups[categoryName]) {
        groups[categoryName] = { count: 0, amount: 0, percentage: 0 };
      }
      groups[categoryName].count++;
      groups[categoryName].amount += expense.amount.toNumber();
    });

    Object.keys(groups).forEach((category) => {
      groups[category].percentage =
        total > 0 ? (groups[category].amount / total) * 100 : 0;
    });

    return groups;
  }

  private groupExpensesByUser(expenses: any[]) {
    const groups: Record<
      string,
      { count: number; amount: number; percentage: number; userId: string }
    > = {};
    const total = expenses.reduce((sum, exp) => sum + exp.amount.toNumber(), 0);

    expenses.forEach((expense) => {
      const userName = expense.user.name;
      if (!groups[userName]) {
        groups[userName] = {
          count: 0,
          amount: 0,
          percentage: 0,
          userId: expense.user.id,
        };
      }
      groups[userName].count++;
      groups[userName].amount += expense.amount.toNumber();
    });

    Object.keys(groups).forEach((user) => {
      groups[user].percentage =
        total > 0 ? (groups[user].amount / total) * 100 : 0;
    });

    return groups;
  }

  private groupExpensesByStore(expenses: any[]) {
    const groups: Record<
      string,
      { count: number; amount: number; percentage: number; storeId: string }
    > = {};
    const total = expenses.reduce((sum, exp) => sum + exp.amount.toNumber(), 0);

    expenses.forEach((expense) => {
      const storeName = expense.store?.name || 'No Store';
      const storeId = expense.store?.id || '';
      if (!groups[storeName]) {
        groups[storeName] = { count: 0, amount: 0, percentage: 0, storeId };
      }
      groups[storeName].count++;
      groups[storeName].amount += expense.amount.toNumber();
    });

    Object.keys(groups).forEach((store) => {
      groups[store].percentage =
        total > 0 ? (groups[store].amount / total) * 100 : 0;
    });

    return groups;
  }

  private generateMonthlyTrend(expenses: any[]) {
    const monthlyData: Record<string, { count: number; amount: number }> = {};

    expenses.forEach((expense) => {
      const monthKey = expense.expenseDate.toISOString().substr(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, amount: 0 };
      }
      monthlyData[monthKey].count++;
      monthlyData[monthKey].amount += expense.amount.toNumber();
    });

    return Object.keys(monthlyData)
      .sort()
      .map((month) => ({
        month,
        count: monthlyData[month].count,
        amount: monthlyData[month].amount,
      }));
  }

  private generateCategoryComparison(current: any, previous: any) {
    const comparison: Record<string, any> = {};

    Object.keys(current).forEach((category) => {
      const currentAmount = current[category].amount;
      const previousAmount = previous[category]?.amount || 0;

      comparison[category] = {
        current: currentAmount,
        previous: previousAmount,
        change: currentAmount - previousAmount,
        changePercentage:
          previousAmount > 0
            ? ((currentAmount - previousAmount) / previousAmount) * 100
            : 0,
      };
    });

    return comparison;
  }

  private generateUserComparison(current: any, previous: any) {
    const comparison: Record<string, any> = {};

    Object.keys(current).forEach((user) => {
      const currentAmount = current[user].amount;
      const previousAmount = previous[user]?.amount || 0;

      comparison[user] = {
        current: currentAmount,
        previous: previousAmount,
        change: currentAmount - previousAmount,
        changePercentage:
          previousAmount > 0
            ? ((currentAmount - previousAmount) / previousAmount) * 100
            : 0,
        userId: current[user].userId,
      };
    });

    return comparison;
  }

  private calculateSpendingVelocity(expenses: any[]) {
    // Calculate spending velocity (amount per day)
    if (expenses.length === 0) return 0;

    const sortedExpenses = expenses.sort(
      (a, b) => a.expenseDate.getTime() - b.expenseDate.getTime(),
    );
    const firstExpense = sortedExpenses[0];
    const lastExpense = sortedExpenses[sortedExpenses.length - 1];
    const daysDiff =
      Math.ceil(
        (lastExpense.expenseDate.getTime() -
          firstExpense.expenseDate.getTime()) /
          86400000,
      ) + 1;
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + exp.amount.toNumber(),
      0,
    );

    return totalAmount / daysDiff;
  }

  private analyzeSeasonality(expenses: any[]) {
    const monthlySpending: Record<number, number> = {};

    expenses.forEach((expense) => {
      const month = expense.expenseDate.getMonth();
      monthlySpending[month] =
        (monthlySpending[month] || 0) + expense.amount.toNumber();
    });

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return months.map((month, index) => ({
      month,
      amount: monthlySpending[index] || 0,
    }));
  }

  private analyzeCategoryTrends(expenses: any[]) {
    // Analyze spending trends by category over time
    const categoryMonthlyData: Record<string, Record<string, number>> = {};

    expenses.forEach((expense) => {
      const category = expense.category.name;
      const monthKey = expense.expenseDate.toISOString().substr(0, 7);

      if (!categoryMonthlyData[category]) {
        categoryMonthlyData[category] = {};
      }

      categoryMonthlyData[category][monthKey] =
        (categoryMonthlyData[category][monthKey] || 0) +
        expense.amount.toNumber();
    });

    return categoryMonthlyData;
  }

  private analyzeUserSpendingPatterns(expenses: any[]) {
    const userPatterns: Record<string, any> = {};

    expenses.forEach((expense) => {
      const userId = expense.user.id;
      const userName = expense.user.name;

      if (!userPatterns[userId]) {
        userPatterns[userId] = {
          name: userName,
          totalAmount: 0,
          totalCount: 0,
          categories: {},
          averageExpenseAmount: 0,
          largestExpense: 0,
          smallestExpense: Number.MAX_VALUE,
        };
      }

      const pattern = userPatterns[userId];
      const amount = expense.amount.toNumber();

      pattern.totalAmount += amount;
      pattern.totalCount++;
      pattern.categories[expense.category.name] =
        (pattern.categories[expense.category.name] || 0) + amount;
      pattern.largestExpense = Math.max(pattern.largestExpense, amount);
      pattern.smallestExpense = Math.min(pattern.smallestExpense, amount);
    });

    Object.keys(userPatterns).forEach((userId) => {
      const pattern = userPatterns[userId];
      pattern.averageExpenseAmount = pattern.totalAmount / pattern.totalCount;
      if (pattern.smallestExpense === Number.MAX_VALUE) {
        pattern.smallestExpense = 0;
      }
    });

    return userPatterns;
  }

  private async getApprovalMetrics(companyId: string, startDate: Date) {
    const approvals = await this.prisma.expenseApproval.findMany({
      where: {
        expense: { companyId },
        createdAt: { gte: startDate },
      },
      include: {
        expense: {
          select: { createdAt: true, amount: true },
        },
      },
    });

    // Calculate average approval time
    const approvalTimes = approvals
      .filter((approval) => approval.expense.createdAt && approval.createdAt)
      .map(
        (approval) =>
          approval.createdAt.getTime() - approval.expense.createdAt.getTime(),
      );

    const averageApprovalTime =
      approvalTimes.length > 0
        ? approvalTimes.reduce((sum, time) => sum + time, 0) /
          approvalTimes.length
        : 0;

    return {
      totalApprovals: approvals.length,
      averageApprovalTimeHours: averageApprovalTime / (1000 * 60 * 60),
      approvalsByAction: this.groupBy(approvals, 'action'),
      totalApprovedAmount: approvals
        .filter((a) => a.action === 'approve')
        .reduce((sum, a) => sum + a.expense.amount.toNumber(), 0),
    };
  }

  private async getBudgetPerformanceMetrics(companyId: string, period: string) {
    // This would integrate with the BudgetService
    // For now, return a placeholder
    return {
      totalBudgets: 0,
      budgetUtilization: 0,
      overBudgetCategories: 0,
      underUtilizedBudgets: 0,
    };
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }
}
