import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialRecordEntity } from './financial-record.entity';
import { FinancialRecordController } from './financial-record.controller';
import { FinancialRecordService } from './financial-record.service';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialRecordEntity])],
  controllers: [FinancialRecordController],
  providers: [FinancialRecordService],
})
export class FinancialRecordModule {}
