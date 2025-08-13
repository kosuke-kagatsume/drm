import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CampaignMetricsDto {
  @IsString()
  campaignId: string;

  @IsNumber()
  @IsOptional()
  impressions?: number;

  @IsNumber()
  @IsOptional()
  clicks?: number;

  @IsNumber()
  @IsOptional()
  conversions?: number;

  @IsNumber()
  @IsOptional()
  leads?: number;

  @IsNumber()
  @IsOptional()
  sales?: number;

  @IsNumber()
  @IsOptional()
  revenue?: number;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsNumber()
  @IsOptional()
  ctr?: number; // Click-through rate

  @IsNumber()
  @IsOptional()
  conversionRate?: number;

  @IsNumber()
  @IsOptional()
  cpa?: number; // Cost per acquisition

  @IsNumber()
  @IsOptional()
  roas?: number; // Return on ad spend

  @IsObject()
  @IsOptional()
  customMetrics?: Record<string, any>;
}
