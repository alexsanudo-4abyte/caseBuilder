import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { TortCampaignEntity } from './tort-campaign.entity';
import { TortCampaignService } from './tort-campaign.service';

@Controller('tort-campaigns')
export class TortCampaignController extends CrudController<TortCampaignEntity> {
  constructor(service: TortCampaignService) {
    super(service);
  }
}
