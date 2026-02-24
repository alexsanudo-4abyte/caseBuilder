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
exports.IntakeSubmissionEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/base.entity");
let IntakeSubmissionEntity = class IntakeSubmissionEntity extends base_entity_1.BaseEntity {
    conversation_id;
    full_name;
    email;
    phone;
    address;
    date_of_birth;
    ai_chat_summary;
    key_facts;
    qualification_score;
    case_type;
    status;
    admin_notes;
    reviewed_by;
    reviewed_date;
    submitted_date;
};
exports.IntakeSubmissionEntity = IntakeSubmissionEntity;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "conversation_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "date_of_birth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "ai_chat_summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], IntakeSubmissionEntity.prototype, "key_facts", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], IntakeSubmissionEntity.prototype, "qualification_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "case_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'pending_review' }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "admin_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "reviewed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "reviewed_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IntakeSubmissionEntity.prototype, "submitted_date", void 0);
exports.IntakeSubmissionEntity = IntakeSubmissionEntity = __decorate([
    (0, typeorm_1.Entity)('intake_submissions')
], IntakeSubmissionEntity);
//# sourceMappingURL=intake-submission.entity.js.map