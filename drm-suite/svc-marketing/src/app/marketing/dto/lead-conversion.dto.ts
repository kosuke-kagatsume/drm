import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsObject,
} from 'class-validator';

export class LeadConversionDto {
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @IsString()
  @IsNotEmpty()
  toStage: string;

  @IsDateString()
  convertedAt: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  conversionData?: Record<string, any>;
}
