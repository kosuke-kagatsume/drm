import { Module } from '@nestjs/common';
import { PrismaModule } from '@drm-suite/prisma';

// Controllers
import { ExpenseCategoryController } from './expense-category.controller';
import { ExpenseController } from './expense.controller';
import { ExpenseApprovalController } from './expense-approval.controller';
import { BudgetController } from './budget.controller';
import { ExpenseReportController } from './expense-report.controller';
import { ExpenseAttachmentController } from './expense-attachment.controller';
import { PaymentMethodController } from './payment-method.controller';

// Services
import { ExpenseCategoryService } from './expense-category.service';
import { ExpenseService } from './expense.service';
import { ExpenseApprovalService } from './expense-approval.service';
import { BudgetService } from './budget.service';
import { ExpenseReportService } from './expense-report.service';
import { ExpenseAttachmentService } from './expense-attachment.service';
import { PaymentMethodService } from './payment-method.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ExpenseCategoryController,
    ExpenseController,
    ExpenseApprovalController,
    BudgetController,
    ExpenseReportController,
    ExpenseAttachmentController,
    PaymentMethodController,
  ],
  providers: [
    ExpenseCategoryService,
    ExpenseService,
    ExpenseApprovalService,
    BudgetService,
    ExpenseReportService,
    ExpenseAttachmentService,
    PaymentMethodService,
  ],
  exports: [
    ExpenseCategoryService,
    ExpenseService,
    ExpenseApprovalService,
    BudgetService,
    ExpenseReportService,
    ExpenseAttachmentService,
    PaymentMethodService,
  ],
})
export class ExpenseModule {}
