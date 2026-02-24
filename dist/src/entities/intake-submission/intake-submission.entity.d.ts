import { BaseEntity } from '../../shared/base.entity';
export declare class IntakeSubmissionEntity extends BaseEntity {
    conversation_id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    ai_chat_summary: string;
    key_facts: string[];
    qualification_score: number;
    case_type: string;
    status: string;
    admin_notes: string;
    reviewed_by: string;
    reviewed_date: string;
    submitted_date: string;
}
