import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const CASE_STATUSES = [
  'intake',
  'qualification',
  'signed',
  'active',
  'discovery',
  'trial_prep',
  'settlement',
  'closed',
  'rejected',
];

export class CreateCaseDto {
  @IsOptional()
  @IsUUID()
  claimant_id?: string;

  @IsOptional()
  @IsUUID()
  tort_campaign_id?: string;

  @IsOptional()
  @IsString()
  intake_submission_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  case_number?: string;

  @IsOptional()
  @IsString()
  case_type?: string;

  @IsOptional()
  @IsIn(CASE_STATUSES)
  status?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  injury_description?: string;

  @IsOptional()
  @IsString()
  injury_date?: string;

  @IsOptional()
  @IsString()
  intake_source?: string;

  @IsOptional()
  @IsString()
  intake_date?: string;

  @IsOptional()
  @IsString()
  assigned_attorney?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_value_low?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_value_high?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  case_strength_score?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  credibility_score?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  settlement_probability?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  fraud_score?: number;

  @IsOptional()
  @IsString()
  ai_case_summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ai_risk_factors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ai_strength_factors?: string[];

  @IsOptional()
  @IsBoolean()
  qualifying_criteria_met?: boolean;
}

export class UpdateCaseDto extends PartialType(CreateCaseDto) {}
