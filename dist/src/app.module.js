"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const users_module_1 = require("./users/users.module");
const integrations_module_1 = require("./integrations/integrations.module");
const case_module_1 = require("./entities/case/case.module");
const task_module_1 = require("./entities/task/task.module");
const fraud_alert_module_1 = require("./entities/fraud-alert/fraud-alert.module");
const document_module_1 = require("./entities/document/document.module");
const medical_record_module_1 = require("./entities/medical-record/medical-record.module");
const tort_campaign_module_1 = require("./entities/tort-campaign/tort-campaign.module");
const communication_module_1 = require("./entities/communication/communication.module");
const financial_record_module_1 = require("./entities/financial-record/financial-record.module");
const prediction_module_1 = require("./entities/prediction/prediction.module");
const intake_submission_module_1 = require("./entities/intake-submission/intake-submission.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            integrations_module_1.IntegrationsModule,
            case_module_1.CaseModule,
            task_module_1.TaskModule,
            fraud_alert_module_1.FraudAlertModule,
            document_module_1.DocumentModule,
            medical_record_module_1.MedicalRecordModule,
            tort_campaign_module_1.TortCampaignModule,
            communication_module_1.CommunicationModule,
            financial_record_module_1.FinancialRecordModule,
            prediction_module_1.PredictionModule,
            intake_submission_module_1.IntakeSubmissionModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map