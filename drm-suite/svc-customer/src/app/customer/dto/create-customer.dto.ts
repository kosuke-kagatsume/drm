import {
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  IsDateString,
  IsArray,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  location?: any; // JSON object with coordinates

  @IsIn(['lead', 'prospect', 'customer', 'inactive'])
  status: 'lead' | 'prospect' | 'customer' | 'inactive';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Business info
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  employees?: number;

  @IsOptional()
  revenue?: number;

  // Interaction tracking
  @IsOptional()
  @IsDateString()
  firstContact?: string;

  @IsOptional()
  @IsDateString()
  lastContact?: string;

  @IsOptional()
  @IsDateString()
  nextActionDate?: string;

  @IsOptional()
  @IsString()
  nextAction?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  // CRM data
  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsOptional()
  lifeTimeValue?: number;

  @IsOptional()
  acquisitionCost?: number;

  // Communication preferences
  @IsOptional()
  @IsIn(['email', 'phone', 'sms', 'line'])
  preferredContact?: 'email' | 'phone' | 'sms' | 'line';

  @IsOptional()
  communicationHistory?: any[];

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  createdBy: string;
}
