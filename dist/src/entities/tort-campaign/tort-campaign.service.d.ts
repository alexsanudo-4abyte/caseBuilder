import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { TortCampaignEntity } from './tort-campaign.entity';
export declare class TortCampaignService extends CrudService<TortCampaignEntity> {
    constructor(repo: Repository<TortCampaignEntity>);
}
