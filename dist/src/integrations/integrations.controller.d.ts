import { IntegrationsService } from './integrations.service';
export declare class IntegrationsController {
    private readonly service;
    constructor(service: IntegrationsService);
    invokeLLM(body: {
        prompt: string;
        response_json_schema?: object;
    }): Promise<unknown>;
}
