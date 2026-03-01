import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { FraudAlertEntity } from './fraud-alert.entity';
import { FraudAlertService } from './fraud-alert.service';
import { CreateFraudAlertDto, UpdateFraudAlertDto } from './dto/fraud-alert.dto';

@Controller('fraud-alerts')
export class FraudAlertController extends CrudController<FraudAlertEntity> {
  constructor(readonly service: FraudAlertService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateFraudAlertDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFraudAlertDto) {
    return this.service.update(id, dto);
  }
}
