import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryFilterDto,
  CreateStockMovementDto,
  CreateStockCountDto,
  UpdateStockCountDto,
} from './dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  findAll(@Query() filter: InventoryFilterDto) {
    return this.inventoryService.findAll(filter);
  }

  @Get('low-stock/:companyId')
  getLowStock(
    @Param('companyId') companyId: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.inventoryService.getLowStockItems(companyId, storeId);
  }

  @Get('value/:companyId')
  getInventoryValue(
    @Param('companyId') companyId: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.inventoryService.getInventoryValue(companyId, storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Post('movement')
  @HttpCode(HttpStatus.CREATED)
  createMovement(@Body() createMovementDto: CreateStockMovementDto) {
    return this.inventoryService.createStockMovement(createMovementDto);
  }

  @Get(':id/movements')
  getMovements(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.inventoryService.getStockMovements(
      id,
      limit ? +limit : 20,
      offset ? +offset : 0,
    );
  }

  @Post('count')
  @HttpCode(HttpStatus.CREATED)
  createCount(@Body() createCountDto: CreateStockCountDto) {
    return this.inventoryService.createStockCount(createCountDto);
  }

  @Patch('count/:id')
  updateCount(
    @Param('id') id: string,
    @Body() updateCountDto: UpdateStockCountDto,
  ) {
    return this.inventoryService.updateStockCount(id, updateCountDto);
  }

  @Get(':id/counts')
  getCounts(@Param('id') id: string, @Query('sessionId') sessionId?: string) {
    return this.inventoryService.getStockCounts(id, sessionId);
  }
}
