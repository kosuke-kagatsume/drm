import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsDecimal,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string; // email, social, event, etc

  @IsString()
  @IsNotEmpty()
  status: string; // draft, active, paused, completed

  @IsDecimal()
  @Type(() => Number)
  budgetPlanned: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsObject()
  @IsOptional()
  targetAudience?: Record<string, any>;

  @IsArray()
  @IsOptional()
  channels?: string[];

  @IsObject()
  @IsOptional()
  metrics?: Record<string, any>;
}
