import { IsString, IsEnum, IsOptional, Length } from 'class-validator';

export enum ApprovalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_INFO = 'request_info',
}

export class CreateExpenseApprovalDto {
  @IsString()
  expenseId: string;

  @IsString()
  userId: string;

  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string;
}

export class ExpenseApprovalFilterDto {
  @IsOptional()
  @IsString()
  expenseId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(ApprovalAction)
  action?: ApprovalAction;
}
