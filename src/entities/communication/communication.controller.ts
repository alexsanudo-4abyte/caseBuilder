import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { CommunicationEntity } from './communication.entity';
import { CommunicationService } from './communication.service';
import { CreateCommunicationDto, UpdateCommunicationDto } from './dto/communication.dto';

const ACCESS_ROLES = [Role.ATTORNEY, Role.CASE_MANAGER];

@Controller('communications')
export class CommunicationController extends CrudController<CommunicationEntity> {
  constructor(readonly service: CommunicationService) {
    super(service);
  }

  @Get()
  @Roles(...ACCESS_ROLES)
  findAll(@Query() query: Record<string, string>) {
    const { sort, limit, ...filters } = query;
    const limitNum = limit ? +limit : undefined;
    if (Object.keys(filters).length) return this.service.filter(filters as any, sort, limitNum);
    return this.service.list(sort, limitNum);
  }

  @Get(':id')
  @Roles(...ACCESS_ROLES)
  findOne(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  @Roles(...ACCESS_ROLES)
  create(@Body() dto: CreateCommunicationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(...ACCESS_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateCommunicationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles() // admin only
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
