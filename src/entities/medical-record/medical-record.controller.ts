import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { MedicalRecordEntity } from './medical-record.entity';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical-record.dto';

@Controller('medical-records')
export class MedicalRecordController extends CrudController<MedicalRecordEntity> {
  constructor(readonly service: MedicalRecordService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.service.update(id, dto);
  }
}
