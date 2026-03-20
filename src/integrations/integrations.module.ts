import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { EmailService } from './email.service';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, EmailService],
  exports: [IntegrationsService, EmailService],
})
export class IntegrationsModule {}
