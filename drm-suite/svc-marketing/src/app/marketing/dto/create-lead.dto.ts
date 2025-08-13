import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsObject,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsString()
  @IsNotEmpty()
  stage: string; // LEAD, VISIT, CONTRACT

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  score?: number = 0;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
