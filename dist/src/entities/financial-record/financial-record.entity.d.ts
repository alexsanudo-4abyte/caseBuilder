import { BaseEntity } from '../../shared/base.entity';
export declare class FinancialRecordEntity extends BaseEntity {
    case_id: string;
    record_type: string;
    amount: number;
    category: string;
    description: string;
}
