import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsDecimal,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ExpenseStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export class CreateExpenseDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsString()
  userId: string;

  @IsString()
  categoryId: string;

  @IsString()
  @Length(1, 200)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'JPY';

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus = ExpenseStatus.DRAFT;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
