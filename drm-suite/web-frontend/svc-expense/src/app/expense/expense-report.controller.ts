import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ExpenseReportService } from './expense-report.service';
import { ExpenseReportRequestDto } from './dto';

@Controller('expense-reports')
export class ExpenseReportController {
  constructor(private readonly expenseReportService: ExpenseReportService) {}

  @Post('generate')
  async generateExpenseReport(
    @Body(ValidationPipe) request: ExpenseReportRequestDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense report generated successfully',
      data: await this.expenseReportService.generateExpenseReport(request),
    };
  }

  @Get('analytics/:companyId')
  async generateExpenseAnalytics(
    @Param('companyId') companyId: string,
    @Query('period') period?: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense analytics generated successfully',
      data: await this.expenseReportService.generateExpenseAnalytics(
        companyId,
        period,
      ),
    };
  }
}
