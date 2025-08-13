import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @IsString()
  companyId: string;

  @IsString()
  storeId: string;

  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  currentStock: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minStock: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxStock: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
