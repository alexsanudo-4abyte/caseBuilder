import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudAlertEntity } from './fraud-alert.entity';
import { FraudAlertController } from './fraud-alert.controller';
import { FraudAlertService } from './fraud-alert.service';

@Module({
  imports: [TypeOrmModule.forFeature([FraudAlertEntity])],
  controllers: [FraudAlertController],
  providers: [FraudAlertService],
})
export class FraudAlertModule {}
