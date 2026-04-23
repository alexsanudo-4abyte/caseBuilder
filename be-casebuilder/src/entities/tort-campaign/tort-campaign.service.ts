import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { TortCampaignEntity } from './tort-campaign.entity';

@Injectable()
export class TortCampaignService extends CrudService<TortCampaignEntity> {
  constructor(
    @InjectRepository(TortCampaignEntity)
    repo: Repository<TortCampaignEntity>,
  ) {
    super(repo);
  }
}
