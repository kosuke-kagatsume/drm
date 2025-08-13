import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  ExpenseCategoryFilterDto,
} from './dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseCategoryDto: CreateExpenseCategoryDto) {
    // Check if code already exists for this company
    const existingCode = await this.prisma.expenseCategory.findUnique({
      where: {
        companyId_code: {
          companyId: createExpenseCategoryDto.companyId,
          code: createExpenseCategoryDto.code,
        },
      },
    });

    if (existingCode) {
      throw new BadRequestException(
        `Category code ${createExpenseCategoryDto.code} already exists for this company`,
      );
    }

    // Validate parent category if specified
    if (createExpenseCategoryDto.parentId) {
      const parentCategory = await this.prisma.expenseCategory.findFirst({
        where: {
          id: createExpenseCategoryDto.parentId,
          companyId: createExpenseCategoryDto.companyId,
        },
      });

      if (!parentCategory) {
        throw new BadRequestException(
          `Parent category with ID ${createExpenseCategoryDto.parentId} not found`,
        );
      }
    }

    return this.prisma.expenseCategory.create({
      data: {
        ...createExpenseCategoryDto,
        isActive: createExpenseCategoryDto.isActive ?? true,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            expenses: true,
            budgets: true,
            children: true,
          },
        },
      },
    });
  }

  async findAll(filter: ExpenseCategoryFilterDto) {
    const where: Prisma.ExpenseCategoryWhereInput = {};

    if (filter.companyId) {
      where.companyId = filter.companyId;
    }

    if (filter.parentId) {
      where.parentId = filter.parentId;
    } else if (filter.parentId === null) {
      where.parentId = null; // Root categories only
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.expenseCategory.findMany({
        where,
        include: {
          parent: true,
          children: {
            include: {
              _count: {
                select: {
                  expenses: true,
                  budgets: true,
                },
              },
            },
          },
          _count: {
            select: {
              expenses: true,
              budgets: true,
              children: true,
            },
          },
        },
        take: filter.limit || 50,
        skip: filter.offset || 0,
        orderBy: [{ name: 'asc' }],
      }),
      this.prisma.expenseCategory.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            children: true,
            _count: {
              select: {
                expenses: true,
                budgets: true,
              },
            },
          },
        },
        expenses: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        budgets: {
          orderBy: { fiscal: 'desc' },
        },
        _count: {
          select: {
            expenses: true,
            budgets: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Expense category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
    const category = await this.findOne(id);

    // Check if code already exists (if being updated)
    if (
      updateExpenseCategoryDto.code &&
      updateExpenseCategoryDto.code !== category.code
    ) {
      const existingCode = await this.prisma.expenseCategory.findUnique({
        where: {
          companyId_code: {
            companyId: category.companyId,
            code: updateExpenseCategoryDto.code,
          },
        },
      });

      if (existingCode) {
        throw new BadRequestException(
          `Category code ${updateExpenseCategoryDto.code} already exists for this company`,
        );
      }
    }

    // Validate parent category if being updated
    if (updateExpenseCategoryDto.parentId !== undefined) {
      if (updateExpenseCategoryDto.parentId) {
        // Check if parent exists and belongs to same company
        const parentCategory = await this.prisma.expenseCategory.findFirst({
          where: {
            id: updateExpenseCategoryDto.parentId,
            companyId: category.companyId,
          },
        });

        if (!parentCategory) {
          throw new BadRequestException(
            `Parent category with ID ${updateExpenseCategoryDto.parentId} not found`,
          );
        }

        // Prevent circular references
        if (await this.isDescendant(updateExpenseCategoryDto.parentId, id)) {
          throw new BadRequestException(
            'Cannot set a descendant category as parent',
          );
        }
      }
    }

    return this.prisma.expenseCategory.update({
      where: { id },
      data: updateExpenseCategoryDto,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            expenses: true,
            budgets: true,
            children: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Check if category has children
    if (category._count.children > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories',
      );
    }

    // Check if category has expenses
    if (category._count.expenses > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated expenses',
      );
    }

    // Check if category has budgets
    if (category._count.budgets > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated budgets',
      );
    }

    return this.prisma.expenseCategory.delete({
      where: { id },
    });
  }

  async getHierarchy(companyId: string) {
    const rootCategories = await this.prisma.expenseCategory.findMany({
      where: {
        companyId,
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
                _count: {
                  select: {
                    expenses: true,
                    budgets: true,
                  },
                },
              },
              _count: {
                select: {
                  expenses: true,
                  budgets: true,
                  children: true,
                },
              },
            },
            _count: {
              select: {
                expenses: true,
                budgets: true,
                children: true,
              },
            },
          },
          _count: {
            select: {
              expenses: true,
              budgets: true,
              children: true,
            },
          },
        },
        _count: {
          select: {
            expenses: true,
            budgets: true,
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rootCategories;
  }

  async getCategoryPath(id: string): Promise<string[]> {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: { parent: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const path = [category.name];

    if (category.parent) {
      const parentPath = await this.getCategoryPath(category.parent.id);
      return [...parentPath, ...path];
    }

    return path;
  }

  private async isDescendant(
    potentialAncestorId: string,
    potentialDescendantId: string,
  ): Promise<boolean> {
    if (potentialAncestorId === potentialDescendantId) {
      return true;
    }

    const descendants = await this.prisma.expenseCategory.findMany({
      where: { parentId: potentialDescendantId },
      select: { id: true },
    });

    for (const descendant of descendants) {
      if (await this.isDescendant(potentialAncestorId, descendant.id)) {
        return true;
      }
    }

    return false;
  }

  async getUsageStatistics(companyId: string) {
    const categories = await this.prisma.expenseCategory.findMany({
      where: { companyId, isActive: true },
      include: {
        _count: {
          select: {
            expenses: true,
            budgets: true,
          },
        },
        expenses: {
          select: {
            amount: true,
            expenseDate: true,
          },
          where: {
            expenseDate: {
              gte: new Date(new Date().getFullYear(), 0, 1), // Current year
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      code: category.code,
      expenseCount: category._count.expenses,
      budgetCount: category._count.budgets,
      totalExpenseAmount: category.expenses.reduce(
        (sum, expense) => sum + expense.amount.toNumber(),
        0,
      ),
      lastExpenseDate:
        category.expenses.length > 0
          ? Math.max(...category.expenses.map((e) => e.expenseDate.getTime()))
          : null,
    }));
  }
}
