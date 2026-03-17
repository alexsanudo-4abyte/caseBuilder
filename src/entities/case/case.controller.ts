import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';
import { CaseAnalysisService } from './case-analysis.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

const READ_ROLES = [Role.ATTORNEY, Role.INTAKE_STAFF, Role.CASE_MANAGER];
const WRITE_ROLES = [Role.ATTORNEY, Role.CASE_MANAGER];

@Controller('cases')
export class CaseController extends CrudController<CaseEntity> {
  constructor(
    readonly service: CaseService,
    private readonly caseAnalysisService: CaseAnalysisService,
  ) {
    super(service);
  }

  @Get()
  @Roles(...READ_ROLES)
  findAll(@Query() query: Record<string, string>) {
    const { sort, limit, ...filters } = query;
    const limitNum = limit ? +limit : undefined;
    if (Object.keys(filters).length)
      return this.service.filter(filters as any, sort, limitNum);
    return this.service.list(sort, limitNum);
  }

  @Get(':id')
  @Roles(...READ_ROLES)
  findOne(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  @Roles(...READ_ROLES)
  create(@Body() dto: CreateCaseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/analyze')
  @Roles(...WRITE_ROLES)
  analyze(@Param('id') id: string) {
    return this.caseAnalysisService.analyze(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles() // admin only
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
