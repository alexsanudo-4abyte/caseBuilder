import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { CommunicationEntity } from './communication.entity';
import { CommunicationService } from './communication.service';
import { CreateCommunicationDto, UpdateCommunicationDto } from './dto/communication.dto';

@Controller('communications')
export class CommunicationController extends CrudController<CommunicationEntity> {
  constructor(readonly service: CommunicationService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateCommunicationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommunicationDto) {
    return this.service.update(id, dto);
  }
}
