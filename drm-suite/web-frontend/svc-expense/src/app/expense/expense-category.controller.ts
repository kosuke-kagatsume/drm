import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ExpenseCategoryService } from './expense-category.service';
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  ExpenseCategoryFilterDto,
} from './dto';

@Controller('expense-categories')
export class ExpenseCategoryController {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
  ) {}

  @Post()
  async create(
    @Body(ValidationPipe) createExpenseCategoryDto: CreateExpenseCategoryDto,
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Expense category created successfully',
      data: await this.expenseCategoryService.create(createExpenseCategoryDto),
    };
  }

  @Get()
  async findAll(@Query(ValidationPipe) filter: ExpenseCategoryFilterDto) {
    const result = await this.expenseCategoryService.findAll(filter);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense categories retrieved successfully',
      data: result.items,
      meta: {
        total: result.total,
        limit: filter.limit || 50,
        offset: filter.offset || 0,
      },
    };
  }

  @Get('hierarchy/:companyId')
  async getHierarchy(@Param('companyId') companyId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Category hierarchy retrieved successfully',
      data: await this.expenseCategoryService.getHierarchy(companyId),
    };
  }

  @Get('statistics/:companyId')
  async getUsageStatistics(@Param('companyId') companyId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Category usage statistics retrieved successfully',
      data: await this.expenseCategoryService.getUsageStatistics(companyId),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense category retrieved successfully',
      data: await this.expenseCategoryService.findOne(id),
    };
  }

  @Get(':id/path')
  async getCategoryPath(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Category path retrieved successfully',
      data: {
        id,
        path: await this.expenseCategoryService.getCategoryPath(id),
      },
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExpenseCategoryDto: UpdateExpenseCategoryDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense category updated successfully',
      data: await this.expenseCategoryService.update(
        id,
        updateExpenseCategoryDto,
      ),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.expenseCategoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense category deleted successfully',
    };
  }
}
