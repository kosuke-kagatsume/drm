import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryFilterDto,
  CreateStockMovementDto,
  MovementType,
  CreateStockCountDto,
  UpdateStockCountDto,
  CountStatus,
} from './dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const existingSku = await this.prisma.inventory.findUnique({
      where: {
        companyId_sku: {
          companyId: createInventoryDto.companyId,
          sku: createInventoryDto.sku,
        },
      },
    });

    if (existingSku) {
      throw new BadRequestException(
        `SKU ${createInventoryDto.sku} already exists for this company`,
      );
    }

    return this.prisma.inventory.create({
      data: {
        ...createInventoryDto,
        currentStock: new Prisma.Decimal(createInventoryDto.currentStock),
        minStock: new Prisma.Decimal(createInventoryDto.minStock),
        maxStock: new Prisma.Decimal(createInventoryDto.maxStock),
        attributes: createInventoryDto.attributes || {},
      },
      include: {
        company: true,
        store: true,
      },
    });
  }

  async findAll(filter: InventoryFilterDto) {
    const where: Prisma.InventoryWhereInput = {};

    if (filter.companyId) {
      where.companyId = filter.companyId;
    }

    if (filter.storeId) {
      where.storeId = filter.storeId;
    }

    if (filter.category) {
      where.category = filter.category;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        include: {
          company: true,
          store: true,
          _count: {
            select: {
              movements: true,
              counts: true,
            },
          },
        },
        take: filter.limit || 20,
        skip: filter.offset || 0,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    const processedItems = items.map((item) => {
      const lowStock = item.currentStock < item.minStock;
      const overStock = item.currentStock > item.maxStock;

      return {
        ...item,
        lowStock,
        overStock,
        stockStatus: lowStock ? 'low' : overStock ? 'over' : 'normal',
      };
    });

    if (filter.lowStock) {
      return {
        items: processedItems.filter((item) => item.lowStock),
        total: processedItems.filter((item) => item.lowStock).length,
      };
    }

    return {
      items: processedItems,
      total,
    };
  }

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        company: true,
        store: true,
        lots: {
          orderBy: { createdAt: 'desc' },
        },
        movements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        counts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    const inventory = await this.findOne(id);

    const updateData: any = { ...updateInventoryDto };

    if (updateInventoryDto.currentStock !== undefined) {
      updateData.currentStock = new Prisma.Decimal(
        updateInventoryDto.currentStock,
      );
    }
    if (updateInventoryDto.minStock !== undefined) {
      updateData.minStock = new Prisma.Decimal(updateInventoryDto.minStock);
    }
    if (updateInventoryDto.maxStock !== undefined) {
      updateData.maxStock = new Prisma.Decimal(updateInventoryDto.maxStock);
    }

    return this.prisma.inventory.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        store: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.inventory.delete({
      where: { id },
    });
  }

  async createStockMovement(createMovementDto: CreateStockMovementDto) {
    const inventory = await this.findOne(createMovementDto.inventoryId);

    const movement = await this.prisma.$transaction(async (tx) => {
      let newStock = inventory.currentStock;
      const quantity = new Prisma.Decimal(createMovementDto.quantity);

      switch (createMovementDto.type) {
        case MovementType.IN:
          newStock = newStock.add(quantity);
          break;
        case MovementType.OUT:
          newStock = newStock.sub(quantity);
          if (newStock.lessThan(0)) {
            throw new BadRequestException('Insufficient stock');
          }
          break;
        case MovementType.ADJUST:
          newStock = quantity;
          break;
      }

      await tx.inventory.update({
        where: { id: createMovementDto.inventoryId },
        data: { currentStock: newStock },
      });

      return tx.stockMovement.create({
        data: {
          ...createMovementDto,
          quantity,
          metadata: createMovementDto.metadata || {},
        },
      });
    });

    return movement;
  }

  async getStockMovements(inventoryId: string, limit = 20, offset = 0) {
    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { inventoryId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.stockMovement.count({
        where: { inventoryId },
      }),
    ]);

    return {
      items: movements,
      total,
    };
  }

  async createStockCount(createCountDto: CreateStockCountDto) {
    const inventory = await this.findOne(createCountDto.inventoryId);

    const countedQty = new Prisma.Decimal(createCountDto.countedQty);
    const systemQty = inventory.currentStock;
    const variance = countedQty.sub(systemQty);

    return this.prisma.stockCount.create({
      data: {
        ...createCountDto,
        countedQty,
        systemQty,
        variance,
        status: CountStatus.PENDING,
        countedAt: createCountDto.countedAt
          ? new Date(createCountDto.countedAt)
          : new Date(),
      },
    });
  }

  async updateStockCount(id: string, updateCountDto: UpdateStockCountDto) {
    const count = await this.prisma.stockCount.findUnique({
      where: { id },
    });

    if (!count) {
      throw new NotFoundException(`Stock count with ID ${id} not found`);
    }

    if (
      updateCountDto.status === CountStatus.APPROVED &&
      count.status === CountStatus.PENDING
    ) {
      await this.prisma.$transaction(async (tx) => {
        await tx.stockCount.update({
          where: { id },
          data: { status: updateCountDto.status },
        });

        await tx.inventory.update({
          where: { id: count.inventoryId },
          data: { currentStock: count.countedQty },
        });

        await tx.stockMovement.create({
          data: {
            inventoryId: count.inventoryId,
            type: MovementType.ADJUST,
            quantity: count.variance,
            reason: `Stock count adjustment - Session: ${count.sessionId}`,
            reference: count.id,
            metadata: { stockCountId: count.id },
          },
        });
      });

      return { message: 'Stock count approved and inventory adjusted' };
    }

    return this.prisma.stockCount.update({
      where: { id },
      data: { status: updateCountDto.status },
    });
  }

  async getStockCounts(inventoryId: string, sessionId?: string) {
    const where: Prisma.StockCountWhereInput = { inventoryId };

    if (sessionId) {
      where.sessionId = sessionId;
    }

    return this.prisma.stockCount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLowStockItems(companyId: string, storeId?: string) {
    const where: Prisma.InventoryWhereInput = {
      companyId,
      isActive: true,
    };

    if (storeId) {
      where.storeId = storeId;
    }

    const items = await this.prisma.inventory.findMany({
      where,
      include: {
        store: true,
      },
    });

    return items.filter((item) => item.currentStock < item.minStock);
  }

  async getInventoryValue(companyId: string, storeId?: string) {
    const where: Prisma.InventoryWhereInput = {
      companyId,
      isActive: true,
    };

    if (storeId) {
      where.storeId = storeId;
    }

    const items = await this.prisma.inventory.findMany({
      where,
      include: {
        store: true,
      },
    });

    const summary = {
      totalItems: items.length,
      totalQuantity: items.reduce(
        (sum, item) => sum.add(item.currentStock),
        new Prisma.Decimal(0),
      ),
      lowStockItems: items.filter((item) => item.currentStock < item.minStock)
        .length,
      overStockItems: items.filter((item) => item.currentStock > item.maxStock)
        .length,
      byCategory: {} as Record<string, any>,
      byStore: {} as Record<string, any>,
    };

    items.forEach((item) => {
      if (!summary.byCategory[item.category]) {
        summary.byCategory[item.category] = {
          count: 0,
          quantity: new Prisma.Decimal(0),
        };
      }
      summary.byCategory[item.category].count++;
      summary.byCategory[item.category].quantity = summary.byCategory[
        item.category
      ].quantity.add(item.currentStock);

      if (!summary.byStore[item.store.name]) {
        summary.byStore[item.store.name] = {
          count: 0,
          quantity: new Prisma.Decimal(0),
        };
      }
      summary.byStore[item.store.name].count++;
      summary.byStore[item.store.name].quantity = summary.byStore[
        item.store.name
      ].quantity.add(item.currentStock);
    });

    return summary;
  }
}
