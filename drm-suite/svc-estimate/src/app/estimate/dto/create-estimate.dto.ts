import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateEstimateItemDto {
  @IsString()
  itemCode: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsDecimal()
  quantity: number;

  @IsString()
  unit: string;

  @IsDecimal()
  unitPrice: number;

  @IsDecimal()
  totalPrice: number;

  @IsOptional()
  @IsDecimal()
  costPrice?: number;
}

class CreateCostDto {
  @IsString()
  category: string;

  @IsString()
  name: string;

  @IsDecimal()
  amount: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateContractorDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  scope: string;

  @IsDecimal()
  amount: number;

  @IsString()
  status: string;
}

export class CreateEstimateDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsString()
  userId: string;

  @IsString()
  estimateNumber: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  customerName: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  constructMethod?: string;

  @IsOptional()
  @IsString()
  structure?: string;

  @IsDecimal()
  totalAmount: number;

  @IsDecimal()
  taxAmount: number;

  @IsOptional()
  @IsDecimal()
  discountAmount?: number;

  @IsOptional()
  @IsDecimal()
  profitMargin?: number;

  @IsDateString()
  validUntil: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEstimateItemDto)
  items?: CreateEstimateItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCostDto)
  costs?: CreateCostDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractorDto)
  contractors?: CreateContractorDto[];
}
