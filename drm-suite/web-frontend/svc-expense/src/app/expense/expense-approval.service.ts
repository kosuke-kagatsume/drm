import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateExpenseApprovalDto,
  ApprovalAction,
  ExpenseApprovalFilterDto,
  ExpenseStatus,
} from './dto';

@Injectable()
export class ExpenseApprovalService {
  constructor(private prisma: PrismaService) {}

  async createApproval(createApprovalDto: CreateExpenseApprovalDto) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: createApprovalDto.expenseId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: true,
        approvalHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(
        `Expense with ID ${createApprovalDto.expenseId} not found`,
      );
    }

    // Check if expense is in a state that allows approval actions
    if (expense.status !== ExpenseStatus.SUBMITTED) {
      throw new BadRequestException(
        'Can only process approval for submitted expenses',
      );
    }

    // Check if user is trying to approve their own expense
    if (expense.userId === createApprovalDto.userId) {
      throw new ForbiddenException('Cannot approve your own expense');
    }

    // Check if this user has already made an approval decision
    const existingApproval = expense.approvalHistory.find(
      (approval) => approval.userId === createApprovalDto.userId,
    );

    if (existingApproval) {
      throw new BadRequestException('You have already processed this expense');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create approval record
      const approval = await tx.expenseApproval.create({
        data: createApprovalDto,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          expense: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
              category: true,
            },
          },
        },
      });

      // Update expense status based on approval action
      let newStatus: ExpenseStatus;
      let updateData: any = {};

      switch (createApprovalDto.action) {
        case ApprovalAction.APPROVE:
          newStatus = ExpenseStatus.APPROVED;
          updateData = {
            status: newStatus,
            approvedBy: createApprovalDto.userId,
            approvedAt: new Date(),
          };
          break;

        case ApprovalAction.REJECT:
          newStatus = ExpenseStatus.REJECTED;
          updateData = { status: newStatus };
          break;

        case ApprovalAction.REQUEST_INFO:
          newStatus = ExpenseStatus.DRAFT; // Send back to draft for revision
          updateData = { status: newStatus };
          break;
      }

      await tx.expense.update({
        where: { id: createApprovalDto.expenseId },
        data: updateData,
      });

      return approval;
    });
  }

  async getApprovalHistory(expenseId: string) {
    const approvals = await this.prisma.expenseApproval.findMany({
      where: { expenseId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return approvals;
  }

  async getPendingApprovals(userId: string, companyId: string) {
    // Get expenses that are submitted and need approval
    // Exclude expenses submitted by the current user
    const pendingExpenses = await this.prisma.expense.findMany({
      where: {
        companyId,
        status: ExpenseStatus.SUBMITTED,
        userId: { not: userId }, // Cannot approve own expenses
        approvalHistory: {
          none: {
            userId, // Haven't been processed by this user
          },
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: true,
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
      orderBy: { createdAt: 'asc' },
    });

    return pendingExpenses;
  }

  async getApprovalQueue(filter: ExpenseApprovalFilterDto) {
    const where: Prisma.ExpenseApprovalWhereInput = {};

    if (filter.expenseId) {
      where.expenseId = filter.expenseId;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.action) {
      where.action = filter.action;
    }

    const approvals = await this.prisma.expenseApproval.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        expense: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            category: true,
            store: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return approvals;
  }

  async getApprovalStatistics(companyId: string, period?: string) {
    const whereClause: Prisma.ExpenseApprovalWhereInput = {
      expense: {
        companyId,
      },
    };

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
          whereClause.createdAt = {
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
        whereClause.createdAt = { gte: startDate };
      }
    }

    const approvals = await this.prisma.expenseApproval.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true },
        },
        expense: {
          select: {
            amount: true,
            category: {
              select: { name: true },
            },
          },
        },
      },
    });

    const statistics = {
      totalApprovals: approvals.length,
      byAction: {} as Record<string, { count: number; totalAmount: number }>,
      byApprover: {} as Record<string, { count: number; totalAmount: number }>,
      averageProcessingTime: 0,
      quickestApproval: Number.MAX_VALUE,
      slowestApproval: 0,
    };

    // Group by action
    approvals.forEach((approval) => {
      if (!statistics.byAction[approval.action]) {
        statistics.byAction[approval.action] = { count: 0, totalAmount: 0 };
      }
      statistics.byAction[approval.action].count++;
      statistics.byAction[approval.action].totalAmount +=
        approval.expense.amount.toNumber();
    });

    // Group by approver
    approvals.forEach((approval) => {
      const approverName = approval.user.name;
      if (!statistics.byApprover[approverName]) {
        statistics.byApprover[approverName] = { count: 0, totalAmount: 0 };
      }
      statistics.byApprover[approverName].count++;
      statistics.byApprover[approverName].totalAmount +=
        approval.expense.amount.toNumber();
    });

    return statistics;
  }

  async bulkApproveExpenses(
    expenseIds: string[],
    userId: string,
    comment?: string,
  ) {
    const results = [];

    for (const expenseId of expenseIds) {
      try {
        const approval = await this.createApproval({
          expenseId,
          userId,
          action: ApprovalAction.APPROVE,
          comment,
        });
        results.push({ expenseId, status: 'approved', approval });
      } catch (error) {
        results.push({
          expenseId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async delegateApproval(
    expenseId: string,
    fromUserId: string,
    toUserId: string,
    comment?: string,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        approvalHistory: true,
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${expenseId} not found`);
    }

    if (expense.status !== ExpenseStatus.SUBMITTED) {
      throw new BadRequestException(
        'Can only delegate approval for submitted expenses',
      );
    }

    // Check if fromUser has pending approval for this expense
    const hasPendingApproval = !expense.approvalHistory.some(
      (approval) => approval.userId === fromUserId,
    );

    if (!hasPendingApproval) {
      throw new BadRequestException(
        'You do not have pending approval for this expense',
      );
    }

    // Create delegation record in approval history
    return this.prisma.expenseApproval.create({
      data: {
        expenseId,
        userId: fromUserId,
        action: ApprovalAction.REQUEST_INFO,
        comment: `Delegated to user ${toUserId}. ${comment || ''}`,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        expense: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            category: true,
          },
        },
      },
    });
  }

  async getExpenseApprovalWorkflow(companyId: string) {
    // This could be configured per company/category in the future
    // For now, return a simple single-step approval workflow
    return {
      steps: [
        {
          stepNumber: 1,
          name: 'Manager Approval',
          description:
            'Direct manager or authorized approver reviews the expense',
          requiredRoles: ['manager', 'admin'],
          autoApprovalRules: [
            {
              condition: 'amount <= 1000',
              action: 'auto_approve',
            },
            {
              condition: 'category.code === "MEAL" && amount <= 5000',
              action: 'auto_approve',
            },
          ],
        },
      ],
      settings: {
        requireReceiptForAmountAbove: 1000,
        maxAutoApprovalAmount: 1000,
        escalationAfterDays: 7,
      },
    };
  }
}
