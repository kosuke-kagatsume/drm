import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ResourceType {
  MEETING_ROOM = 'MEETING_ROOM',
  CAR = 'CAR',
  EQUIPMENT = 'EQUIPMENT',
  OTHER = 'OTHER',
}

export class CreateResourceDto {
  @IsEnum(ResourceType)
  type: ResourceType;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  capacity?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
