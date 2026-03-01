import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { DocumentEntity } from './document.entity';
import { DocumentService } from './document.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

const ACCESS_ROLES = [Role.ATTORNEY, Role.INTAKE_STAFF, Role.CASE_MANAGER];

@Controller('documents')
export class DocumentController extends CrudController<DocumentEntity> {
  constructor(readonly service: DocumentService) {
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
  create(@Body() dto: CreateDocumentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(...ACCESS_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles() // admin only
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
