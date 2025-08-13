import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';
import { IsDecimal, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsDecimal()
  @Type(() => Number)
  @IsOptional()
  budgetActual?: number;
}
