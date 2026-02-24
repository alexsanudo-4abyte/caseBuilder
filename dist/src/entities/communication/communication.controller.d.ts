import { CrudController } from '../../shared/crud.controller';
import { CommunicationEntity } from './communication.entity';
import { CommunicationService } from './communication.service';
export declare class CommunicationController extends CrudController<CommunicationEntity> {
    constructor(service: CommunicationService);
}
