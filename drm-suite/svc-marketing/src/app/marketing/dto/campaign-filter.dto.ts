import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';

export class CampaignFilterDto {
  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsDateString()
  @IsOptional()
  startDateFrom?: string;

  @IsDateString()
  @IsOptional()
  startDateTo?: string;

  @IsDateString()
  @IsOptional()
  endDateFrom?: string;

  @IsDateString()
  @IsOptional()
  endDateTo?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
