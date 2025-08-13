import { IsString, IsNumber, Min } from 'class-validator';

export class CreateExpenseAttachmentDto {
  @IsString()
  expenseId: string;

  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsString()
  fileType: string;
}

export class ExpenseAttachmentFilterDto {
  @IsString()
  expenseId: string;
}
