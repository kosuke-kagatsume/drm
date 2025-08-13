import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilterDto,
  CreateInteractionDto,
} from './dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll(@Query(ValidationPipe) filter: CustomerFilterDto) {
    return this.customerService.findAll(filter);
  }

  @Get('stats')
  getStats(
    @Query('companyId') companyId: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.customerService.getStats(companyId, storeId);
  }

  @Get('export')
  exportCustomers(
    @Query('companyId') companyId: string,
    @Query('format') format: 'csv' | 'json' = 'csv',
  ) {
    return this.customerService.exportCustomers(companyId, format);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Get(':id/interactions')
  getInteractions(
    @Param('id') customerId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.customerService.getInteractions(
      customerId,
      limit ? parseInt(limit.toString()) : undefined,
      offset ? parseInt(offset.toString()) : undefined,
    );
  }

  @Post()
  create(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  importCustomers(
    @Body('companyId') companyId: string,
    @Body('customers') customers: any[],
    @Body('createdBy') createdBy: string,
  ) {
    return this.customerService.importCustomers(
      companyId,
      customers,
      createdBy,
    );
  }

  @Post(':id/interactions')
  addInteraction(
    @Body(ValidationPipe) createInteractionDto: CreateInteractionDto,
  ) {
    return this.customerService.addInteraction(createInteractionDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCustomerDto: UpdateCustomerDto,
  ) {
    updateCustomerDto.id = id;
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
