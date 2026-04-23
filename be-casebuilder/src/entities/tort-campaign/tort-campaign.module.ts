import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TortCampaignEntity } from './tort-campaign.entity';
import { TortCampaignController } from './tort-campaign.controller';
import { TortCampaignService } from './tort-campaign.service';

@Module({
  imports: [TypeOrmModule.forFeature([TortCampaignEntity])],
  controllers: [TortCampaignController],
  providers: [TortCampaignService],
})
export class TortCampaignModule {}
