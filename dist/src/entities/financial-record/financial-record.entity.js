"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialRecordEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/base.entity");
let FinancialRecordEntity = class FinancialRecordEntity extends base_entity_1.BaseEntity {
    case_id;
    record_type;
    amount;
    category;
    description;
};
exports.FinancialRecordEntity = FinancialRecordEntity;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FinancialRecordEntity.prototype, "case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FinancialRecordEntity.prototype, "record_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], FinancialRecordEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FinancialRecordEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FinancialRecordEntity.prototype, "description", void 0);
exports.FinancialRecordEntity = FinancialRecordEntity = __decorate([
    (0, typeorm_1.Entity)('financial_records')
], FinancialRecordEntity);
//# sourceMappingURL=financial-record.entity.js.map