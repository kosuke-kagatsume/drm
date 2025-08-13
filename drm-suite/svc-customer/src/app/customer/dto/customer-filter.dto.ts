import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  Min,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CustomerFilterDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priorityMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  priorityMax?: number;

  // Date filters
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @IsOptional()
  @IsDateString()
  lastContactFrom?: string;

  @IsOptional()
  @IsDateString()
  lastContactTo?: string;

  // Value filters
  @IsOptional()
  @IsInt()
  @Min(0)
  lifeTimeValueMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lifeTimeValueMax?: number;

  // Search
  @IsOptional()
  @IsString()
  search?: string; // Search in name, company, email

  // Sort
  @IsOptional()
  @IsIn([
    'createdAt',
    'updatedAt',
    'name',
    'company',
    'status',
    'lastContact',
    'lifeTimeValue',
    'priority',
  ])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  // Pagination
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
