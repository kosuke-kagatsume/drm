import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBudgetDto {
  @IsString()
  companyId: string;

  @IsString()
  categoryId: string;

  @IsString()
  @Length(1, 20)
  fiscal: string; // 2024Q1, 2024M01, 2024

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'JPY';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BudgetFilterDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  fiscal?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}
