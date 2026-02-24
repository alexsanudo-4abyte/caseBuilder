"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudAlertModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fraud_alert_entity_1 = require("./fraud-alert.entity");
const fraud_alert_controller_1 = require("./fraud-alert.controller");
const fraud_alert_service_1 = require("./fraud-alert.service");
let FraudAlertModule = class FraudAlertModule {
};
exports.FraudAlertModule = FraudAlertModule;
exports.FraudAlertModule = FraudAlertModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([fraud_alert_entity_1.FraudAlertEntity])],
        controllers: [fraud_alert_controller_1.FraudAlertController],
        providers: [fraud_alert_service_1.FraudAlertService],
    })
], FraudAlertModule);
//# sourceMappingURL=fraud-alert.module.js.map