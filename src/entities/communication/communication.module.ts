import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationEntity } from './communication.entity';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommunicationEntity])],
  controllers: [CommunicationController],
  providers: [CommunicationService],
})
export class CommunicationModule {}
