import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseEntity } from './case.entity';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaseEntity])],
  controllers: [CaseController],
  providers: [CaseService],
})
export class CaseModule {}
