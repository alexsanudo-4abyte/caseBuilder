import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { PredictionEntity } from './prediction.entity';
import { PredictionService } from './prediction.service';
import { CreatePredictionDto, UpdatePredictionDto } from './dto/prediction.dto';

@Controller('predictions')
export class PredictionController extends CrudController<PredictionEntity> {
  constructor(readonly service: PredictionService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreatePredictionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePredictionDto) {
    return this.service.update(id, dto);
  }
}
