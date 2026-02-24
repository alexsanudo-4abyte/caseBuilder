import { BaseEntity } from '../../shared/base.entity';
export declare class FraudAlertEntity extends BaseEntity {
    case_id: string;
    alert_type: string;
    severity: string;
    description: string;
    evidence: string;
    ai_confidence: number;
    detection_method: string;
    status: string;
    resolution_notes: string;
    reviewed_date: string;
}
