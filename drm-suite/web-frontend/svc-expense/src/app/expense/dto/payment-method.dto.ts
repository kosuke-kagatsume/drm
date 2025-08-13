import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  Length,
} from 'class-validator';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  DIGITAL_WALLET = 'digital_wallet',
  CHECK = 'check',
}

export class CreatePaymentMethodDto {
  @IsString()
  companyId: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @IsOptional()
  details?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @IsOptional()
  details?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PaymentMethodFilterDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
