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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto } from './dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body(ValidationPipe) createExpenseDto: CreateExpenseDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Expense created successfully',
      data: await this.expenseService.create(createExpenseDto),
    };
  }

  @Get()
  async findAll(@Query(ValidationPipe) filter: ExpenseFilterDto) {
    const result = await this.expenseService.findAll(filter);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expenses retrieved successfully',
      data: result.items,
      meta: {
        total: result.total,
        limit: filter.limit || 20,
        offset: filter.offset || 0,
      },
    };
  }

  @Get('summary')
  async getExpensesSummary(
    @Query('companyId') companyId: string,
    @Query('userId') userId?: string,
    @Query('period') period?: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expenses summary retrieved successfully',
      data: await this.expenseService.getExpensesSummary(
        companyId,
        userId,
        period,
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense retrieved successfully',
      data: await this.expenseService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExpenseDto: UpdateExpenseDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense updated successfully',
      data: await this.expenseService.update(id, updateExpenseDto),
    };
  }

  @Post(':id/submit')
  async submitExpense(@Param('id') id: string, @Body('userId') userId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense submitted for approval',
      data: await this.expenseService.submitExpense(id, userId),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.expenseService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense deleted successfully',
    };
  }
}
