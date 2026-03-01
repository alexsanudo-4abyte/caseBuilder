import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { CaseEntity } from './case.entity';
import { CaseService } from './case.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

@Controller('cases')
export class CaseController extends CrudController<CaseEntity> {
  constructor(readonly service: CaseService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateCaseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
    return this.service.update(id, dto);
  }
}
