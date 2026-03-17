import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const STAFF_ROLES = ['admin', 'attorney', 'intake_staff', 'case_manager'];

export class UpdateStaffUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsIn(STAFF_ROLES)
  role?: string;
}
