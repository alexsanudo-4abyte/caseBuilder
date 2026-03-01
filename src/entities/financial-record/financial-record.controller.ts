import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { FinancialRecordEntity } from './financial-record.entity';
import { FinancialRecordService } from './financial-record.service';
import { CreateFinancialRecordDto, UpdateFinancialRecordDto } from './dto/financial-record.dto';

@Controller('financial-records')
export class FinancialRecordController extends CrudController<FinancialRecordEntity> {
  constructor(readonly service: FinancialRecordService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateFinancialRecordDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFinancialRecordDto) {
    return this.service.update(id, dto);
  }
}
