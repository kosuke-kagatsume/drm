import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseFilterDto,
  ExpenseStatus,
} from './dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    // Validate category exists and belongs to the same company
    const category = await this.prisma.expenseCategory.findFirst({
      where: {
        id: createExpenseDto.categoryId,
        companyId: createExpenseDto.companyId,
        isActive: true,
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createExpenseDto.categoryId} not found or inactive`,
      );
    }

    // Check budget availability if expense is being submitted
    if (createExpenseDto.status === ExpenseStatus.SUBMITTED) {
      await this.checkBudgetAvailability(
        createExpenseDto.companyId,
        createExpenseDto.categoryId,
        createExpenseDto.amount,
        new Date(createExpenseDto.expenseDate),
      );
    }

    return this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        amount: new Prisma.Decimal(createExpenseDto.amount),
        expenseDate: new Date(createExpenseDto.expenseDate),
        metadata: createExpenseDto.metadata || {},
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { id: true, name: true },
        },
        attachments: true,
        approvalHistory: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findAll(filter: ExpenseFilterDto) {
    const where: Prisma.ExpenseWhereInput = {};

    if (filter.companyId) {
      where.companyId = filter.companyId;
    }

    if (filter.storeId) {
      where.storeId = filter.storeId;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      where.expenseDate = {};
      if (filter.startDate) {
        where.expenseDate.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.expenseDate.lte = new Date(filter.endDate);
      }
    }

    if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
      where.amount = {};
      if (filter.minAmount !== undefined) {
        where.amount.gte = new Prisma.Decimal(filter.minAmount);
      }
      if (filter.maxAmount !== undefined) {
        where.amount.lte = new Prisma.Decimal(filter.maxAmount);
      }
    }

    if (filter.projectId) {
      where.projectId = filter.projectId;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: {
          category: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          approver: {
            select: { id: true, name: true, email: true },
          },
          store: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              attachments: true,
              approvalHistory: true,
            },
          },
        },
        take: filter.limit || 20,
        skip: filter.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { id: true, name: true },
        },
        attachments: true,
        approvalHistory: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.findOne(id);

    // Check if expense can be updated based on status
    if (expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot update paid expense');
    }

    if (
      expense.status === ExpenseStatus.APPROVED &&
      updateExpenseDto.status !== ExpenseStatus.PAID
    ) {
      throw new BadRequestException(
        'Approved expense can only be marked as paid',
      );
    }

    // Validate category if being updated
    if (
      updateExpenseDto.categoryId &&
      updateExpenseDto.categoryId !== expense.categoryId
    ) {
      const category = await this.prisma.expenseCategory.findFirst({
        where: {
          id: updateExpenseDto.categoryId,
          companyId: expense.companyId,
          isActive: true,
        },
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updateExpenseDto.categoryId} not found or inactive`,
        );
      }
    }

    // Check budget availability if amount or category is being changed
    if (
      (updateExpenseDto.amount !== undefined &&
        updateExpenseDto.amount !== expense.amount.toNumber()) ||
      (updateExpenseDto.categoryId &&
        updateExpenseDto.categoryId !== expense.categoryId)
    ) {
      await this.checkBudgetAvailability(
        expense.companyId,
        updateExpenseDto.categoryId || expense.categoryId,
        updateExpenseDto.amount || expense.amount.toNumber(),
        new Date(updateExpenseDto.expenseDate || expense.expenseDate),
        id, // Exclude current expense from budget calculation
      );
    }

    const updateData: any = { ...updateExpenseDto };

    if (updateExpenseDto.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(updateExpenseDto.amount);
    }
    if (updateExpenseDto.expenseDate) {
      updateData.expenseDate = new Date(updateExpenseDto.expenseDate);
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { id: true, name: true },
        },
        attachments: true,
        approvalHistory: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async remove(id: string) {
    const expense = await this.findOne(id);

    // Check if expense can be deleted
    if (
      expense.status === ExpenseStatus.APPROVED ||
      expense.status === ExpenseStatus.PAID
    ) {
      throw new BadRequestException('Cannot delete approved or paid expense');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete attachments first
      await tx.expenseAttachment.deleteMany({
        where: { expenseId: id },
      });

      // Delete approval history
      await tx.expenseApproval.deleteMany({
        where: { expenseId: id },
      });

      // Delete expense
      return tx.expense.delete({
        where: { id },
      });
    });
  }

  async submitExpense(id: string, userId: string) {
    const expense = await this.findOne(id);

    if (expense.userId !== userId) {
      throw new BadRequestException('Can only submit your own expenses');
    }

    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft expenses');
    }

    // Check budget availability
    await this.checkBudgetAvailability(
      expense.companyId,
      expense.categoryId,
      expense.amount.toNumber(),
      expense.expenseDate,
      id,
    );

    return this.prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.SUBMITTED,
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getExpensesSummary(
    companyId: string,
    userId?: string,
    period?: string,
  ) {
    const whereClause: Prisma.ExpenseWhereInput = { companyId };

    if (userId) {
      whereClause.userId = userId;
    }

    // Add period filter if specified
    if (period) {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          whereClause.expenseDate = {
            gte: startDate,
            lt: new Date(now.getFullYear(), now.getMonth(), 1),
          };
          break;
        case 'current_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      if (period !== 'last_month') {
        whereClause.expenseDate = { gte: startDate };
      }
    }

    const expenses = await this.prisma.expense.findMany({
      where: whereClause,
      include: {
        category: true,
      },
    });

    const summary = {
      totalAmount: expenses.reduce(
        (sum, exp) => sum + exp.amount.toNumber(),
        0,
      ),
      totalCount: expenses.length,
      byStatus: {} as Record<string, { count: number; amount: number }>,
      byCategory: {} as Record<string, { count: number; amount: number }>,
      pending: expenses.filter((e) => e.status === ExpenseStatus.SUBMITTED)
        .length,
      approved: expenses.filter((e) => e.status === ExpenseStatus.APPROVED)
        .length,
      rejected: expenses.filter((e) => e.status === ExpenseStatus.REJECTED)
        .length,
    };

    // Group by status
    expenses.forEach((expense) => {
      if (!summary.byStatus[expense.status]) {
        summary.byStatus[expense.status] = { count: 0, amount: 0 };
      }
      summary.byStatus[expense.status].count++;
      summary.byStatus[expense.status].amount += expense.amount.toNumber();
    });

    // Group by category
    expenses.forEach((expense) => {
      const categoryName = expense.category.name;
      if (!summary.byCategory[categoryName]) {
        summary.byCategory[categoryName] = { count: 0, amount: 0 };
      }
      summary.byCategory[categoryName].count++;
      summary.byCategory[categoryName].amount += expense.amount.toNumber();
    });

    return summary;
  }

  private async checkBudgetAvailability(
    companyId: string,
    categoryId: string,
    amount: number,
    expenseDate: Date,
    excludeExpenseId?: string,
  ) {
    const year = expenseDate.getFullYear();
    const month = expenseDate.getMonth() + 1;
    const quarter = Math.ceil(month / 3);

    // Check budgets in order of specificity: monthly -> quarterly -> yearly
    const fiscalPeriods = [
      `${year}M${month.toString().padStart(2, '0')}`, // Monthly
      `${year}Q${quarter}`, // Quarterly
      `${year}`, // Yearly
    ];

    let budget = null;
    for (const fiscal of fiscalPeriods) {
      budget = await this.prisma.budget.findFirst({
        where: {
          companyId,
          categoryId,
          fiscal,
          isActive: true,
        },
      });
      if (budget) break;
    }

    if (!budget) {
      return; // No budget defined, allow expense
    }

    // Calculate current spending for the period
    let startDate: Date;
    let endDate: Date;

    if (budget.fiscal.includes('M')) {
      // Monthly budget
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else if (budget.fiscal.includes('Q')) {
      // Quarterly budget
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0);
    } else {
      // Yearly budget
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 0);
    }

    const whereClause: Prisma.ExpenseWhereInput = {
      companyId,
      categoryId,
      expenseDate: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID],
      },
    };

    if (excludeExpenseId) {
      whereClause.id = { not: excludeExpenseId };
    }

    const currentSpending = await this.prisma.expense.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    const totalSpending =
      (currentSpending._sum.amount?.toNumber() || 0) + amount;

    if (totalSpending > budget.amount.toNumber()) {
      throw new BadRequestException(
        `Expense would exceed budget. Budget: ${budget.amount}, Current spending: ${currentSpending._sum.amount || 0}, Requested: ${amount}`,
      );
    }
  }
}
