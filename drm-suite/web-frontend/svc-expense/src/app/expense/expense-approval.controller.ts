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
import { ExpenseApprovalService } from './expense-approval.service';
import { CreateExpenseApprovalDto, ExpenseApprovalFilterDto } from './dto';

@Controller('expense-approvals')
export class ExpenseApprovalController {
  constructor(
    private readonly expenseApprovalService: ExpenseApprovalService,
  ) {}

  @Post()
  async createApproval(
    @Body(ValidationPipe) createApprovalDto: CreateExpenseApprovalDto,
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Expense approval processed successfully',
      data: await this.expenseApprovalService.createApproval(createApprovalDto),
    };
  }

  @Get('pending/:userId/:companyId')
  async getPendingApprovals(
    @Param('userId') userId: string,
    @Param('companyId') companyId: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Pending approvals retrieved successfully',
      data: await this.expenseApprovalService.getPendingApprovals(
        userId,
        companyId,
      ),
    };
  }

  @Get('queue')
  async getApprovalQueue(
    @Query(ValidationPipe) filter: ExpenseApprovalFilterDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Approval queue retrieved successfully',
      data: await this.expenseApprovalService.getApprovalQueue(filter),
    };
  }

  @Get('statistics/:companyId')
  async getApprovalStatistics(
    @Param('companyId') companyId: string,
    @Query('period') period?: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Approval statistics retrieved successfully',
      data: await this.expenseApprovalService.getApprovalStatistics(
        companyId,
        period,
      ),
    };
  }

  @Get('workflow/:companyId')
  async getExpenseApprovalWorkflow(@Param('companyId') companyId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense approval workflow retrieved successfully',
      data: await this.expenseApprovalService.getExpenseApprovalWorkflow(
        companyId,
      ),
    };
  }

  @Get('history/:expenseId')
  async getApprovalHistory(@Param('expenseId') expenseId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Approval history retrieved successfully',
      data: await this.expenseApprovalService.getApprovalHistory(expenseId),
    };
  }

  @Post('bulk-approve')
  async bulkApproveExpenses(
    @Body() body: { expenseIds: string[]; userId: string; comment?: string },
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Bulk approval processed',
      data: await this.expenseApprovalService.bulkApproveExpenses(
        body.expenseIds,
        body.userId,
        body.comment,
      ),
    };
  }

  @Post('delegate')
  async delegateApproval(
    @Body()
    body: {
      expenseId: string;
      fromUserId: string;
      toUserId: string;
      comment?: string;
    },
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Approval delegated successfully',
      data: await this.expenseApprovalService.delegateApproval(
        body.expenseId,
        body.fromUserId,
        body.toUserId,
        body.comment,
      ),
    };
  }
}
