import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateIntakeSubmissionDto {
  @IsOptional()
  @IsUUID()
  claimant_id?: string;

  @IsOptional()
  @IsUUID()
  tort_campaign_id?: string;

  @IsOptional()
  @IsString()
  case_id?: string;

  @IsOptional()
  @IsObject()
  raw_payload?: Record<string, any>;

  @IsOptional()
  @IsIn(['web_form', 'partner_api', 'phone'])
  intake_channel?: string;

  @IsOptional()
  @IsString()
  ai_chat_summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  key_facts?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualification_score?: number;

  @IsOptional()
  @IsString()
  case_type?: string;

  @IsOptional()
  @IsIn(['pending_review', 'approved', 'rejected', 'more_info_needed'])
  status?: string;

  @IsOptional()
  @IsString()
  admin_notes?: string;

  @IsOptional()
  @IsString()
  reviewed_by?: string;

  @IsOptional()
  @IsString()
  reviewed_date?: string;

  @IsOptional()
  @IsString()
  submitted_date?: string;
}

export class UpdateIntakeSubmissionDto extends PartialType(CreateIntakeSubmissionDto) {}
