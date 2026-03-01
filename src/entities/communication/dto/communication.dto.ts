import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCommunicationDto {
  @IsOptional()
  @IsUUID()
  case_id?: string;

  @IsOptional()
  @IsIn(['email', 'phone', 'sms', 'mail', 'portal', 'in_person'])
  channel?: string;

  @IsOptional()
  @IsString()
  to_name?: string;

  @IsOptional()
  @IsString()
  to_contact?: string;

  @IsOptional()
  @IsString()
  from_name?: string;

  @IsOptional()
  @IsString()
  from_contact?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['inbound', 'outbound'])
  direction?: string;

  @IsOptional()
  @IsString()
  communication_date?: string;

  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  @IsOptional()
  @IsIn(['positive', 'neutral', 'negative'])
  ai_sentiment?: string;

  @IsOptional()
  @IsString()
  ai_summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ai_action_items?: string[];

  @IsOptional()
  @IsBoolean()
  requires_response?: boolean;
}

export class UpdateCommunicationDto extends PartialType(CreateCommunicationDto) {}
