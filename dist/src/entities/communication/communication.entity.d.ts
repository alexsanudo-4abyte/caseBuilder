import { BaseEntity } from '../../shared/base.entity';
export declare class CommunicationEntity extends BaseEntity {
    case_id: string;
    channel: string;
    to_name: string;
    to_contact: string;
    from_name: string;
    from_contact: string;
    subject: string;
    content: string;
    direction: string;
    communication_date: string;
    is_read: boolean;
    ai_sentiment: string;
    ai_summary: string;
    ai_action_items: string[];
    requires_response: boolean;
}
