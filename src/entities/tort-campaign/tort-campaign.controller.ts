import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { TortCampaignEntity } from './tort-campaign.entity';
import { TortCampaignService } from './tort-campaign.service';
import { CreateTortCampaignDto, UpdateTortCampaignDto } from './dto/tort-campaign.dto';

@Controller('tort-campaigns')
export class TortCampaignController extends CrudController<TortCampaignEntity> {
  constructor(readonly service: TortCampaignService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateTortCampaignDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTortCampaignDto) {
    return this.service.update(id, dto);
  }
}
