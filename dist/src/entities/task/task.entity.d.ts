import { BaseEntity } from '../../shared/base.entity';
export declare class TaskEntity extends BaseEntity {
    case_id: string;
    title: string;
    task_type: string;
    status: string;
    priority: string;
}
