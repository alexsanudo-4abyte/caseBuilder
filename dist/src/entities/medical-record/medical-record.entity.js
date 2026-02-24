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
exports.MedicalRecordEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/base.entity");
let MedicalRecordEntity = class MedicalRecordEntity extends base_entity_1.BaseEntity {
    case_id;
    provider_name;
    provider_type;
    provider_address;
    provider_phone;
    request_status;
    request_date;
    records_start_date;
    records_end_date;
    severity_score;
    qualifying_diagnosis_found;
    ai_analysis_status;
    ai_medical_summary;
    diagnoses_extracted;
    procedures_extracted;
    medications_extracted;
    ai_timeline;
};
exports.MedicalRecordEntity = MedicalRecordEntity;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "provider_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "provider_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "provider_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "provider_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'pending' }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "request_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "request_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "records_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "records_end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], MedicalRecordEntity.prototype, "severity_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], MedicalRecordEntity.prototype, "qualifying_diagnosis_found", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'pending' }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "ai_analysis_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], MedicalRecordEntity.prototype, "ai_medical_summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], MedicalRecordEntity.prototype, "diagnoses_extracted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], MedicalRecordEntity.prototype, "procedures_extracted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], MedicalRecordEntity.prototype, "medications_extracted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], MedicalRecordEntity.prototype, "ai_timeline", void 0);
exports.MedicalRecordEntity = MedicalRecordEntity = __decorate([
    (0, typeorm_1.Entity)('medical_records')
], MedicalRecordEntity);
//# sourceMappingURL=medical-record.entity.js.map