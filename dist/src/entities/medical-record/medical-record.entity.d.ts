import { BaseEntity } from '../../shared/base.entity';
export declare class MedicalRecordEntity extends BaseEntity {
    case_id: string;
    provider_name: string;
    provider_type: string;
    provider_address: string;
    provider_phone: string;
    request_status: string;
    request_date: string;
    records_start_date: string;
    records_end_date: string;
    severity_score: number;
    qualifying_diagnosis_found: boolean;
    ai_analysis_status: string;
    ai_medical_summary: string;
    diagnoses_extracted: string[];
    procedures_extracted: string[];
    medications_extracted: string[];
    ai_timeline: any[];
}
