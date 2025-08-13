import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ReportPeriodType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  COMPARISON = 'comparison',
}

export class ExpenseReportRequestDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsEnum(ReportPeriodType)
  periodType: ReportPeriodType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.SUMMARY;

  @IsOptional()
  @IsString()
  compareWith?: string; // Previous period for comparison
}

export class BudgetAnalysisRequestDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsString()
  fiscal: string;

  @IsOptional()
  @IsDateString()
  asOfDate?: string;
}
