import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClaimantDto {
  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  date_of_birth?: string;

  @IsOptional()
  @IsIn(['web_form', 'partner_api', 'phone', 'referral'])
  intake_channel?: string;

  @IsOptional()
  @IsBoolean()
  consent_given?: boolean;

  @IsOptional()
  @IsString()
  consent_timestamp?: string;

  @IsOptional()
  @IsString()
  consent_version?: string;
}

export class UpdateClaimantDto extends PartialType(CreateClaimantDto) {}
