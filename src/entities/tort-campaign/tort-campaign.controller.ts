import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { TortCampaignEntity } from './tort-campaign.entity';
import { TortCampaignService } from './tort-campaign.service';
import { CreateTortCampaignDto, UpdateTortCampaignDto } from './dto/tort-campaign.dto';

const READ_ROLES = [Role.ATTORNEY, Role.INTAKE_STAFF, Role.CASE_MANAGER];
const WRITE_ROLES = [Role.ATTORNEY];

@Controller('tort-campaigns')
export class TortCampaignController extends CrudController<TortCampaignEntity> {
  constructor(readonly service: TortCampaignService) {
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
  create(@Body() dto: CreateTortCampaignDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateTortCampaignDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles() // admin only
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
