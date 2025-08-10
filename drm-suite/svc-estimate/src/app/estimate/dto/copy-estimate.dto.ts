import { IsEnum } from 'class-validator';

export enum CopyMode {
  FULL = 'FULL',
  ITEM = 'ITEM',
}

export class CopyEstimateDto {
  @IsEnum(CopyMode)
  mode: CopyMode;
}
