import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { AuditLogService } from './audit/audit-log.service';
import { UsersModule } from './users/users.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CaseModule } from './entities/case/case.module';
import { TaskModule } from './entities/task/task.module';
import { FraudAlertModule } from './entities/fraud-alert/fraud-alert.module';
import { DocumentModule } from './entities/document/document.module';
import { MedicalRecordModule } from './entities/medical-record/medical-record.module';
import { TortCampaignModule } from './entities/tort-campaign/tort-campaign.module';
import { CommunicationModule } from './entities/communication/communication.module';
import { FinancialRecordModule } from './entities/financial-record/financial-record.module';
import { PredictionModule } from './entities/prediction/prediction.module';
import { IntakeSubmissionModule } from './entities/intake-submission/intake-submission.module';
import { ClaimantModule } from './entities/claimant/claimant.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: config.get('DATABASE_URL')?.includes('localhost') || config.get('DATABASE_URL')?.includes('127.0.0.1') ? false : { rejectUnauthorized: true },
        extra: {
          max: 1,
          idleTimeoutMillis: 10000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuditModule,
    AuthModule,
    UsersModule,
    IntegrationsModule,
    CaseModule,
    TaskModule,
    FraudAlertModule,
    DocumentModule,
    MedicalRecordModule,
    TortCampaignModule,
    CommunicationModule,
    FinancialRecordModule,
    PredictionModule,
    IntakeSubmissionModule,
    ClaimantModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (auditLogService: AuditLogService) => new AuditInterceptor(auditLogService),
      inject: [AuditLogService],
    },
  ],
})
export class AppModule {}
