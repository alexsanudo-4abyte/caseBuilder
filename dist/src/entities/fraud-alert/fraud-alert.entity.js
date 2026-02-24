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
exports.FraudAlertEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/base.entity");
let FraudAlertEntity = class FraudAlertEntity extends base_entity_1.BaseEntity {
    case_id;
    alert_type;
    severity;
    description;
    evidence;
    ai_confidence;
    detection_method;
    status;
    resolution_notes;
    reviewed_date;
};
exports.FraudAlertEntity = FraudAlertEntity;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "alert_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], FraudAlertEntity.prototype, "ai_confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "detection_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'open' }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "resolution_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FraudAlertEntity.prototype, "reviewed_date", void 0);
exports.FraudAlertEntity = FraudAlertEntity = __decorate([
    (0, typeorm_1.Entity)('fraud_alerts')
], FraudAlertEntity);
//# sourceMappingURL=fraud-alert.entity.js.map