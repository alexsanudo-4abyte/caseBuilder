import { BaseEntity } from '../../shared/base.entity';
export declare class PredictionEntity extends BaseEntity {
    case_id: string;
    prediction_type: string;
    predicted_value: number;
    predicted_range_low: number;
    predicted_range_high: number;
    confidence_score: number;
    explanation: string;
    key_factors: string[];
    is_current: boolean;
    prediction_date: string;
    model_version: string;
}
