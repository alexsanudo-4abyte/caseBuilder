import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { FinancialRecordEntity } from './financial-record.entity';
import { FinancialRecordService } from './financial-record.service';
import { CreateFinancialRecordDto, UpdateFinancialRecordDto } from './dto/financial-record.dto';

const READ_ROLES = [Role.ATTORNEY, Role.CASE_MANAGER];
const WRITE_ROLES = [Role.ATTORNEY];

@Controller('financial-records')
export class FinancialRecordController extends CrudController<FinancialRecordEntity> {
  constructor(readonly service: FinancialRecordService) {
    super(service);
  }

  @Get()
  @Roles(...READ_ROLES)
  findAll(@Query() query: Record<string, string>) {
    const { sort, limit, ...filters } = query;
    const limitNum = limit ? +limit : undefined;
    if (Object.keys(filters).length) return this.service.filter(filters as any, sort, limitNum);
    return this.service.list(sort, limitNum);
  }

  @Get(':id')
  @Roles(...READ_ROLES)
  findOne(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  @Roles(...WRITE_ROLES)
  create(@Body() dto: CreateFinancialRecordDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateFinancialRecordDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles() // admin only
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
