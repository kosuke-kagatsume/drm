import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CountStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class CreateStockCountDto {
  @IsString()
  inventoryId: string;

  @IsString()
  sessionId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  countedQty: number;

  @IsString()
  countedBy: string;

  @IsDateString()
  @IsOptional()
  countedAt?: string;
}

export class UpdateStockCountDto {
  @IsEnum(CountStatus)
  status: CountStatus;
}
