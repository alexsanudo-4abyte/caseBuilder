import { Body, Controller, Post } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Post('core/invoke-llm')
  invokeLLM(@Body() body: { prompt: string; response_json_schema?: object }) {
    return this.service.invokeLLM(body.prompt, body.response_json_schema);
  }
}
