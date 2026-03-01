import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreatePredictionDto {
  @IsOptional()
  @IsUUID()
  case_id?: string;

  @IsOptional()
  @IsString()
  prediction_type?: string;

  @IsOptional()
  @IsNumber()
  predicted_value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  predicted_range_low?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  predicted_range_high?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence_score?: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  key_factors?: string[];

  @IsOptional()
  @IsBoolean()
  is_current?: boolean;

  @IsOptional()
  @IsString()
  prediction_date?: string;

  @IsOptional()
  @IsString()
  model_version?: string;
}

export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {}
