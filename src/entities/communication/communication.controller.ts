import { Controller } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { CommunicationEntity } from './communication.entity';
import { CommunicationService } from './communication.service';

@Controller('communications')
export class CommunicationController extends CrudController<CommunicationEntity> {
  constructor(service: CommunicationService) {
    super(service);
  }
}
