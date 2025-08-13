import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from './update-booking.dto';
import { ResourceType } from './create-resource.dto';

export class BookingFilterDto {
  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsEnum(ResourceType)
  @IsOptional()
  resourceType?: ResourceType;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

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
