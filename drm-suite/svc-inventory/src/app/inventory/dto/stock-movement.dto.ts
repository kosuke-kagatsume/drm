import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  ADJUST = 'adjust',
}

export class CreateStockMovementDto {
  @IsString()
  inventoryId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
