import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsDateString()
  @IsOptional()
  convertedAt?: string;
}
