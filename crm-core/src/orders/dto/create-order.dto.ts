import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min } from 'class-validator';
import { IsOrderId } from '../../common/validators/order-id.validator';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateOrderDto {
  @IsOrderId()
  @IsNotEmpty()
  id: number; // 発注ID（8桁）

  @IsString()
  @IsNotEmpty()
  site_id: string; // 現場ID

  @IsString()
  @IsNotEmpty()
  supplier_name: string; // 仕入先名

  @IsDateString()
  @IsNotEmpty()
  order_date: string; // 発注日

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number; // 発注金額

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus; // 発注ステータス

  @IsString()
  @IsOptional()
  category?: string; // 工事種別

  @IsString()
  @IsOptional()
  notes?: string; // 備考
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  supplier_name?: string;

  @IsDateString()
  @IsOptional()
  order_date?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class LinkOrderToBillDto {
  @IsOrderId()
  @IsNotEmpty()
  orders_table_id: number; // 発注ID

  @IsString()
  @IsNotEmpty()
  bill_id: string; // 請求書ID
}