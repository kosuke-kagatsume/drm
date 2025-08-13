import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class LeadFilterDto {
  @IsString()
  @IsOptional()
  campaignId?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  minScore?: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  maxScore?: number;

  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @IsDateString()
  @IsOptional()
  convertedFrom?: string;

  @IsDateString()
  @IsOptional()
  convertedTo?: string;

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
