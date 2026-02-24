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
exports.CaseEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/base.entity");
let CaseEntity = class CaseEntity extends base_entity_1.BaseEntity {
    claimant_name;
    claimant_email;
    claimant_phone;
    claimant_address;
    claimant_dob;
    case_number;
    case_type;
    tort_campaign;
    status;
    priority;
    notes;
    injury_description;
    injury_date;
    intake_source;
    intake_date;
    assigned_attorney;
    estimated_value_low;
    estimated_value_high;
    case_strength_score;
    credibility_score;
    settlement_probability;
    fraud_score;
    ai_case_summary;
    ai_risk_factors;
    ai_strength_factors;
    qualifying_criteria_met;
};
exports.CaseEntity = CaseEntity;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "claimant_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "claimant_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "claimant_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "claimant_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "claimant_dob", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "case_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "case_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "tort_campaign", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'intake' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "injury_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "injury_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "intake_source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "intake_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseEntity.prototype, "assigned_attorney", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], CaseEntity.prototype, "estimated_value_low", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], CaseEntity.prototype, "estimated_value_high", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], CaseEntity.prototype, "case_strength_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], CaseEntity.prototype, "credibility_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], CaseEntity.prototype, "settlement_probability", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], CaseEntity.prototype, "fraud_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "ai_case_summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], CaseEntity.prototype, "ai_risk_factors", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], CaseEntity.prototype, "ai_strength_factors", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], CaseEntity.prototype, "qualifying_criteria_met", void 0);
exports.CaseEntity = CaseEntity = __decorate([
    (0, typeorm_1.Entity)('cases')
], CaseEntity);
//# sourceMappingURL=case.entity.js.map