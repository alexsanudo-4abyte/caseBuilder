import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsIn,
  IsObject,
  IsArray,
  MaxLength,
  Equals,
} from 'class-validator';

export class PublicIntakeDto {
  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  @Equals(true)
  consent_given: boolean;

  @IsString()
  consent_version: string;

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
  @IsUUID()
  tort_campaign_id?: string;

  @IsOptional()
  @IsIn(['web_form', 'partner_api', 'phone'])
  intake_channel?: 'web_form' | 'partner_api' | 'phone';

  @IsOptional()
  @IsObject()
  raw_payload?: Record<string, any>;

  @IsOptional()
  @IsArray()
  conversation?: Array<{ role: string; content: string }>;
}
