import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsString()
  companyId: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  userId: string;

  @IsString()
  resourceId: string;

  @IsString()
  title: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  priority?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
