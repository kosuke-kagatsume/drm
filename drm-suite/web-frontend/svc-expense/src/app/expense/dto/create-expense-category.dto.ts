import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateExpenseCategoryDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 20)
  code: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
