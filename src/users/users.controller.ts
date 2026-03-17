import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { UsersService } from './users.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';

const STAFF_ROLES = [Role.ADMIN, Role.ATTORNEY, Role.INTAKE_STAFF, Role.CASE_MANAGER];

function sanitize(user: any) {
  // Never return password hash over the wire
  const { password: _pw, ...rest } = user;
  return rest;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** List all staff (non-claimant) users */
  @Get()
  @Roles(...STAFF_ROLES)
  async findAll() {
    const users = await this.usersService.findAllStaff();
    return users.map(sanitize);
  }

  /** Admin-only: create a new staff account */
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateStaffUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      full_name: dto.full_name,
      email: dto.email,
      password: hash,
      role: dto.role,
    });
    return sanitize(user);
  }

  /** Admin-only: update role or name of a staff user */
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffUserDto,
    @Req() req: any,
  ) {
    if (req.user.userId === id && dto.role && dto.role !== 'admin') {
      throw new BadRequestException('Cannot demote your own account');
    }
    const updates: any = {};
    if (dto.full_name !== undefined) updates.full_name = dto.full_name;
    if (dto.role !== undefined) updates.role = dto.role;
    if (dto.password) updates.password = await bcrypt.hash(dto.password, 10);
    await this.usersService.update(id, updates);
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException();
    return sanitize(user);
  }

  /** Admin-only: remove a staff user */
  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string, @Req() req: any) {
    if (req.user.userId === id) {
      throw new BadRequestException('Cannot delete your own account');
    }
    await this.usersService.delete(id);
  }
}
