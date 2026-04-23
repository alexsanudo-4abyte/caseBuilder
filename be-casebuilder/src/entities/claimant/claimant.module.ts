import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimantEntity } from './claimant.entity';
import { ClaimantController } from './claimant.controller';
import { ClaimantService } from './claimant.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClaimantEntity])],
  controllers: [ClaimantController],
  providers: [ClaimantService],
  exports: [TypeOrmModule],
})
export class ClaimantModule {}
