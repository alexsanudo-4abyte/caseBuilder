"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialRecordModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financial_record_entity_1 = require("./financial-record.entity");
const financial_record_controller_1 = require("./financial-record.controller");
const financial_record_service_1 = require("./financial-record.service");
let FinancialRecordModule = class FinancialRecordModule {
};
exports.FinancialRecordModule = FinancialRecordModule;
exports.FinancialRecordModule = FinancialRecordModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([financial_record_entity_1.FinancialRecordEntity])],
        controllers: [financial_record_controller_1.FinancialRecordController],
        providers: [financial_record_service_1.FinancialRecordService],
    })
], FinancialRecordModule);
//# sourceMappingURL=financial-record.module.js.map