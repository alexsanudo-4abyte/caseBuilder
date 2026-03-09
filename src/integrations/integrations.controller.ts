import { Body, Controller, Post } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Roles(Role.ADMIN, Role.ATTORNEY, Role.INTAKE_STAFF, Role.CASE_MANAGER, Role.CLAIMANT)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Post('core/invoke-llm')
  invokeLLM(@Body() body: {
    prompt?: string;
    response_json_schema?: object;
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    system?: string;
  }) {
    return this.service.invokeLLM(body.prompt ?? '', body.response_json_schema, body.messages, body.system);
  }
}
