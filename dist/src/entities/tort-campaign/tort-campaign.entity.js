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
exports.TortCampaignEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../shared/base.entity");
let TortCampaignEntity = class TortCampaignEntity extends base_entity_1.BaseEntity {
    name;
    status;
    description;
    defendants;
    statute_of_limitations_info;
    mdl_info;
    estimated_avg_settlement;
    qualifying_criteria;
};
exports.TortCampaignEntity = TortCampaignEntity;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TortCampaignEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'active' }),
    __metadata("design:type", String)
], TortCampaignEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TortCampaignEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Array)
], TortCampaignEntity.prototype, "defendants", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TortCampaignEntity.prototype, "statute_of_limitations_info", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TortCampaignEntity.prototype, "mdl_info", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], TortCampaignEntity.prototype, "estimated_avg_settlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TortCampaignEntity.prototype, "qualifying_criteria", void 0);
exports.TortCampaignEntity = TortCampaignEntity = __decorate([
    (0, typeorm_1.Entity)('tort_campaigns')
], TortCampaignEntity);
//# sourceMappingURL=tort-campaign.entity.js.map