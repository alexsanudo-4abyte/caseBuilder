import { BaseEntity } from '../../shared/base.entity';
export declare class CaseEntity extends BaseEntity {
    claimant_name: string;
    claimant_email: string;
    claimant_phone: string;
    claimant_address: string;
    claimant_dob: string;
    case_number: string;
    case_type: string;
    tort_campaign: string;
    status: string;
    priority: string;
    notes: string;
    injury_description: string;
    injury_date: string;
    intake_source: string;
    intake_date: string;
    assigned_attorney: string;
    estimated_value_low: number;
    estimated_value_high: number;
    case_strength_score: number;
    credibility_score: number;
    settlement_probability: number;
    fraud_score: number;
    ai_case_summary: string;
    ai_risk_factors: string[];
    ai_strength_factors: string[];
    qualifying_criteria_met: boolean;
}
