import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetFilterDto,
  BudgetAnalysisRequestDto,
  ExpenseStatus,
} from './dto';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    // Check if budget already exists for this company, category, and fiscal period
    const existingBudget = await this.prisma.budget.findUnique({
      where: {
        companyId_categoryId_fiscal: {
          companyId: createBudgetDto.companyId,
          categoryId: createBudgetDto.categoryId,
          fiscal: createBudgetDto.fiscal,
        },
      },
    });

    if (existingBudget) {
      throw new BadRequestException(
        `Budget already exists for category ${createBudgetDto.categoryId} in period ${createBudgetDto.fiscal}`,
      );
    }

    // Validate category exists and belongs to the same company
    const category = await this.prisma.expenseCategory.findFirst({
      where: {
        id: createBudgetDto.categoryId,
        companyId: createBudgetDto.companyId,
        isActive: true,
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createBudgetDto.categoryId} not found or inactive`,
      );
    }

    return this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        amount: new Prisma.Decimal(createBudgetDto.amount),
      },
      include: {
        category: true,
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(filter: BudgetFilterDto) {
    const where: Prisma.BudgetWhereInput = {};

    if (filter.companyId) {
      where.companyId = filter.companyId;
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter.fiscal) {
      where.fiscal = filter.fiscal;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const budgets = await this.prisma.budget.findMany({
      where,
      include: {
        category: {
          include: {
            parent: {
              select: { id: true, name: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ fiscal: 'desc' }, { category: { name: 'asc' } }],
    });

    // Add spending information to each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await this.getBudgetSpending(
          budget.companyId,
          budget.categoryId,
          budget.fiscal,
        );

        return {
          ...budget,
          currentSpending: spending.totalSpent,
          remainingBudget: budget.amount.toNumber() - spending.totalSpent,
          utilizationPercentage:
            (spending.totalSpent / budget.amount.toNumber()) * 100,
          expenseCount: spending.expenseCount,
          lastExpenseDate: spending.lastExpenseDate,
        };
      }),
    );

    return budgetsWithSpending;
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            parent: {
              select: { id: true, name: true },
            },
            children: {
              select: { id: true, name: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Get detailed spending information
    const spending = await this.getBudgetSpending(
      budget.companyId,
      budget.categoryId,
      budget.fiscal,
    );

    const expenses = await this.getBudgetExpenses(
      budget.companyId,
      budget.categoryId,
      budget.fiscal,
    );

    return {
      ...budget,
      currentSpending: spending.totalSpent,
      remainingBudget: budget.amount.toNumber() - spending.totalSpent,
      utilizationPercentage:
        (spending.totalSpent / budget.amount.toNumber()) * 100,
      expenseCount: spending.expenseCount,
      lastExpenseDate: spending.lastExpenseDate,
      expenses: expenses.slice(0, 10), // Latest 10 expenses
      monthlyBreakdown: spending.monthlyBreakdown,
    };
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.findOne(id);

    const updateData: any = { ...updateBudgetDto };

    if (updateBudgetDto.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(updateBudgetDto.amount);
    }

    return this.prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.budget.delete({
      where: { id },
    });
  }

  async getBudgetAnalysis(request: BudgetAnalysisRequestDto) {
    const where: Prisma.BudgetWhereInput = {
      companyId: request.companyId,
      fiscal: request.fiscal,
      isActive: true,
    };

    if (request.categoryId) {
      where.categoryId = request.categoryId;
    }

    const budgets = await this.prisma.budget.findMany({
      where,
      include: {
        category: {
          include: {
            parent: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (budgets.length === 0) {
      throw new NotFoundException(
        `No budgets found for fiscal period ${request.fiscal}`,
      );
    }

    const analysis = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await this.getBudgetSpending(
          budget.companyId,
          budget.categoryId,
          budget.fiscal,
          request.asOfDate,
        );

        const utilizationPercentage =
          (spending.totalSpent / budget.amount.toNumber()) * 100;
        const remainingAmount = budget.amount.toNumber() - spending.totalSpent;

        // Calculate trend (compare with previous period)
        const previousFiscal = this.getPreviousFiscalPeriod(request.fiscal);
        const previousSpending = await this.getBudgetSpending(
          budget.companyId,
          budget.categoryId,
          previousFiscal,
          request.asOfDate,
        );

        const trend =
          previousSpending.totalSpent > 0
            ? ((spending.totalSpent - previousSpending.totalSpent) /
                previousSpending.totalSpent) *
              100
            : 0;

        return {
          budget: {
            id: budget.id,
            categoryName: budget.category.name,
            categoryCode: budget.category.code,
            parentCategory: budget.category.parent?.name,
            amount: budget.amount.toNumber(),
            currency: budget.currency,
          },
          spending: {
            totalSpent: spending.totalSpent,
            expenseCount: spending.expenseCount,
            averageExpense:
              spending.expenseCount > 0
                ? spending.totalSpent / spending.expenseCount
                : 0,
            lastExpenseDate: spending.lastExpenseDate,
            monthlyBreakdown: spending.monthlyBreakdown,
          },
          analysis: {
            utilizationPercentage,
            remainingAmount,
            remainingPercentage:
              (remainingAmount / budget.amount.toNumber()) * 100,
            status: this.getBudgetStatus(utilizationPercentage),
            trend: {
              percentage: trend,
              direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
              previousPeriodSpent: previousSpending.totalSpent,
            },
          },
        };
      }),
    );

    // Calculate overall summary
    const totalBudget = budgets.reduce(
      (sum, budget) => sum + budget.amount.toNumber(),
      0,
    );
    const totalSpent = analysis.reduce(
      (sum, item) => sum + item.spending.totalSpent,
      0,
    );
    const totalExpenses = analysis.reduce(
      (sum, item) => sum + item.spending.expenseCount,
      0,
    );

    return {
      fiscal: request.fiscal,
      asOfDate: request.asOfDate || new Date(),
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining: totalBudget - totalSpent,
        overallUtilization: (totalSpent / totalBudget) * 100,
        totalExpenses,
        categoriesCount: budgets.length,
      },
      categories: analysis,
      alerts: this.generateBudgetAlerts(analysis),
    };
  }

  async copyBudgetToNextPeriod(
    sourceCompanyId: string,
    sourceFiscal: string,
    targetFiscal: string,
    adjustmentFactor = 1.0,
  ) {
    const sourceBudgets = await this.prisma.budget.findMany({
      where: {
        companyId: sourceCompanyId,
        fiscal: sourceFiscal,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    if (sourceBudgets.length === 0) {
      throw new NotFoundException(
        `No budgets found for fiscal period ${sourceFiscal}`,
      );
    }

    // Check if target budgets already exist
    const existingTargetBudgets = await this.prisma.budget.findMany({
      where: {
        companyId: sourceCompanyId,
        fiscal: targetFiscal,
      },
    });

    if (existingTargetBudgets.length > 0) {
      throw new BadRequestException(
        `Budgets already exist for fiscal period ${targetFiscal}`,
      );
    }

    const newBudgets = await this.prisma.$transaction(
      sourceBudgets.map((budget) =>
        this.prisma.budget.create({
          data: {
            companyId: budget.companyId,
            categoryId: budget.categoryId,
            fiscal: targetFiscal,
            amount: budget.amount.mul(adjustmentFactor),
            currency: budget.currency,
            isActive: true,
          },
          include: {
            category: true,
          },
        }),
      ),
    );

    return {
      sourceCount: sourceBudgets.length,
      createdCount: newBudgets.length,
      adjustmentFactor,
      sourceFiscal,
      targetFiscal,
      budgets: newBudgets,
    };
  }

  private async getBudgetSpending(
    companyId: string,
    categoryId: string,
    fiscal: string,
    asOfDate?: string,
  ) {
    const { startDate, endDate } = this.getFiscalPeriodDates(fiscal);

    let effectiveEndDate = endDate;
    if (asOfDate) {
      const asOfDateTime = new Date(asOfDate);
      if (asOfDateTime < endDate) {
        effectiveEndDate = asOfDateTime;
      }
    }

    const expenses = await this.prisma.expense.findMany({
      where: {
        companyId,
        categoryId,
        expenseDate: {
          gte: startDate,
          lte: effectiveEndDate,
        },
        status: {
          in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID],
        },
      },
      select: {
        amount: true,
        expenseDate: true,
      },
    });

    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount.toNumber(),
      0,
    );
    const lastExpenseDate =
      expenses.length > 0
        ? new Date(Math.max(...expenses.map((e) => e.expenseDate.getTime())))
        : null;

    // Create monthly breakdown
    const monthlyBreakdown: Record<string, number> = {};
    expenses.forEach((expense) => {
      const monthKey = expense.expenseDate.toISOString().substr(0, 7); // YYYY-MM
      monthlyBreakdown[monthKey] =
        (monthlyBreakdown[monthKey] || 0) + expense.amount.toNumber();
    });

    return {
      totalSpent,
      expenseCount: expenses.length,
      lastExpenseDate,
      monthlyBreakdown,
    };
  }

  private async getBudgetExpenses(
    companyId: string,
    categoryId: string,
    fiscal: string,
  ) {
    const { startDate, endDate } = this.getFiscalPeriodDates(fiscal);

    return this.prisma.expense.findMany({
      where: {
        companyId,
        categoryId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID],
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  private getFiscalPeriodDates(fiscal: string): {
    startDate: Date;
    endDate: Date;
  } {
    if (fiscal.includes('M')) {
      // Monthly: 2024M01
      const [year, month] = fiscal.replace('M', '-').split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      return { startDate, endDate };
    } else if (fiscal.includes('Q')) {
      // Quarterly: 2024Q1
      const year = parseInt(fiscal.substring(0, 4));
      const quarter = parseInt(fiscal.substring(5));
      const startMonth = (quarter - 1) * 3;
      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, startMonth + 3, 0);
      return { startDate, endDate };
    } else {
      // Yearly: 2024
      const year = parseInt(fiscal);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 0);
      return { startDate, endDate };
    }
  }

  private getPreviousFiscalPeriod(fiscal: string): string {
    if (fiscal.includes('M')) {
      // Monthly
      const [year, month] = fiscal.replace('M', '-').split('-');
      const prevMonth = parseInt(month) - 1;
      const prevYear = prevMonth === 0 ? parseInt(year) - 1 : parseInt(year);
      const adjustedMonth = prevMonth === 0 ? 12 : prevMonth;
      return `${prevYear}M${adjustedMonth.toString().padStart(2, '0')}`;
    } else if (fiscal.includes('Q')) {
      // Quarterly
      const year = parseInt(fiscal.substring(0, 4));
      const quarter = parseInt(fiscal.substring(5));
      const prevQuarter = quarter === 1 ? 4 : quarter - 1;
      const prevYear = quarter === 1 ? year - 1 : year;
      return `${prevYear}Q${prevQuarter}`;
    } else {
      // Yearly
      const year = parseInt(fiscal);
      return (year - 1).toString();
    }
  }

  private getBudgetStatus(utilizationPercentage: number): string {
    if (utilizationPercentage >= 100) return 'exceeded';
    if (utilizationPercentage >= 90) return 'critical';
    if (utilizationPercentage >= 75) return 'warning';
    if (utilizationPercentage >= 50) return 'on_track';
    return 'under_utilized';
  }

  private generateBudgetAlerts(analysis: any[]): any[] {
    const alerts = [];

    analysis.forEach((item) => {
      const { budget, analysis: budgetAnalysis } = item;

      if (budgetAnalysis.utilizationPercentage >= 100) {
        alerts.push({
          type: 'budget_exceeded',
          severity: 'high',
          category: budget.categoryName,
          message: `Budget exceeded by ${(budgetAnalysis.utilizationPercentage - 100).toFixed(1)}%`,
          amount: budgetAnalysis.remainingAmount,
        });
      } else if (budgetAnalysis.utilizationPercentage >= 90) {
        alerts.push({
          type: 'budget_warning',
          severity: 'medium',
          category: budget.categoryName,
          message: `Budget utilization at ${budgetAnalysis.utilizationPercentage.toFixed(1)}%`,
          amount: budgetAnalysis.remainingAmount,
        });
      }

      if (budgetAnalysis.trend.percentage > 50) {
        alerts.push({
          type: 'spending_increase',
          severity: 'medium',
          category: budget.categoryName,
          message: `Spending increased by ${budgetAnalysis.trend.percentage.toFixed(1)}% compared to previous period`,
          amount:
            item.spending.totalSpent - budgetAnalysis.trend.previousPeriodSpent,
        });
      }
    });

    return alerts;
  }
}
