import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTortCampaignDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'closed'])
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defendants?: string[];

  @IsOptional()
  @IsString()
  statute_of_limitations_info?: string;

  @IsOptional()
  @IsString()
  mdl_info?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_avg_settlement?: number;

  @IsOptional()
  @IsString()
  qualifying_criteria?: string;
}

export class UpdateTortCampaignDto extends PartialType(CreateTortCampaignDto) {}
