import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
