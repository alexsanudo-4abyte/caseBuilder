import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionEntity } from './prediction.entity';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';

@Module({
  imports: [TypeOrmModule.forFeature([PredictionEntity])],
  controllers: [PredictionController],
  providers: [PredictionService],
})
export class PredictionModule {}
