import { Repository } from 'typeorm';
import { CrudService } from '../../shared/crud.service';
import { CommunicationEntity } from './communication.entity';
export declare class CommunicationService extends CrudService<CommunicationEntity> {
    constructor(repo: Repository<CommunicationEntity>);
}
