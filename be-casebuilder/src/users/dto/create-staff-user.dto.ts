import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

const STAFF_ROLES = ['admin', 'attorney', 'intake_staff', 'case_manager'];

export class CreateStaffUserDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(STAFF_ROLES)
  role: string;
}
