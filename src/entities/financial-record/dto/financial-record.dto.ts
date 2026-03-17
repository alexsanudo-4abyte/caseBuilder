import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

const RECORD_TYPES = ['expense', 'settlement', 'fee', 'cost', 'award', 'other'];
const CATEGORIES = [
  'medical',
  'legal',
  'expert_witness',
  'filing',
  'travel',
  'administrative',
  'other',
];

export class CreateFinancialRecordDto {
  @IsOptional()
  @IsUUID()
  case_id?: string;

  @IsOptional()
  @IsIn(RECORD_TYPES)
  record_type?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFinancialRecordDto extends PartialType(
  CreateFinancialRecordDto,
) {}
