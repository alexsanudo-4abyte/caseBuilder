import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

const DOCUMENT_TYPES = [
  'medical_record',
  'legal_filing',
  'correspondence',
  'evidence',
  'contract',
  'intake_form',
  'other',
];

export class CreateDocumentDto {
  @IsOptional()
  @IsUUID()
  case_id?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsIn(DOCUMENT_TYPES)
  document_type?: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsString()
  uploaded_by?: string;

  @IsOptional()
  @IsString()
  uploaded_at?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  document_version?: number;

  @IsOptional()
  @IsBoolean()
  requires_authorization?: boolean;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
