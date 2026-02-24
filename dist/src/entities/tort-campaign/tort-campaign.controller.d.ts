import { CrudController } from '../../shared/crud.controller';
import { TortCampaignEntity } from './tort-campaign.entity';
import { TortCampaignService } from './tort-campaign.service';
export declare class TortCampaignController extends CrudController<TortCampaignEntity> {
    constructor(service: TortCampaignService);
}
