import { BaseEntity } from '../../shared/base.entity';
export declare class TortCampaignEntity extends BaseEntity {
    name: string;
    status: string;
    description: string;
    defendants: string[];
    statute_of_limitations_info: string;
    mdl_info: string;
    estimated_avg_settlement: number;
    qualifying_criteria: string;
}
