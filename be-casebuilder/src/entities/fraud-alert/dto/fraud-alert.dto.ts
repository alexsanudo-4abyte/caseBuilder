import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateFraudAlertDto {
  @IsOptional()
  @IsUUID()
  case_id?: string;

  @IsOptional()
  @IsString()
  alert_type?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  evidence?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  ai_confidence?: number;

  @IsOptional()
  @IsIn(['ai_detection', 'manual_review', 'system_flag', 'staff_report'])
  detection_method?: string;

  @IsOptional()
  @IsIn(['open', 'investigating', 'resolved', 'dismissed'])
  status?: string;

  @IsOptional()
  @IsString()
  resolution_notes?: string;

  @IsOptional()
  @IsString()
  reviewed_date?: string;
}

export class UpdateFraudAlertDto extends PartialType(CreateFraudAlertDto) {}
