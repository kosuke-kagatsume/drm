import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateInteractionDto {
  @IsString()
  customerId: string;

  @IsIn(['call', 'email', 'meeting', 'chat', 'line', 'note', 'visit'])
  type: 'call' | 'email' | 'meeting' | 'chat' | 'line' | 'note' | 'visit';

  @IsIn(['inbound', 'outbound'])
  direction: 'inbound' | 'outbound';

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsIn([
    'interested',
    'not_interested',
    'follow_up_scheduled',
    'quote_requested',
    'meeting_scheduled',
    'no_answer',
    'callback_requested',
  ])
  outcome?: string;

  @IsOptional()
  @IsString()
  nextAction?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  metadata?: any;
}
