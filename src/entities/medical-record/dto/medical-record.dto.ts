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
  Min,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @IsOptional()
  @IsUUID()
  case_id?: string;

  @IsOptional()
  @IsString()
  provider_name?: string;

  @IsOptional()
  @IsIn(['hospital', 'clinic', 'specialist', 'primary_care', 'pharmacy', 'lab', 'other'])
  provider_type?: string;

  @IsOptional()
  @IsString()
  provider_address?: string;

  @IsOptional()
  @IsString()
  provider_phone?: string;

  @IsOptional()
  @IsIn(['pending', 'requested', 'received', 'processing', 'complete', 'unavailable'])
  request_status?: string;

  @IsOptional()
  @IsString()
  request_date?: string;

  @IsOptional()
  @IsString()
  records_start_date?: string;

  @IsOptional()
  @IsString()
  records_end_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  severity_score?: number;

  @IsOptional()
  @IsBoolean()
  qualifying_diagnosis_found?: boolean;

  @IsOptional()
  @IsIn(['pending', 'processing', 'complete', 'failed'])
  ai_analysis_status?: string;

  @IsOptional()
  @IsString()
  ai_medical_summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnoses_extracted?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  procedures_extracted?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications_extracted?: string[];

  @IsOptional()
  @IsArray()
  ai_timeline?: any[];
}

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}
