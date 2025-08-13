import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryFilterDto {
  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  lowStock?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;
}
