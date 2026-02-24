"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntakeSubmissionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const intake_submission_entity_1 = require("./intake-submission.entity");
const intake_submission_controller_1 = require("./intake-submission.controller");
const intake_submission_service_1 = require("./intake-submission.service");
let IntakeSubmissionModule = class IntakeSubmissionModule {
};
exports.IntakeSubmissionModule = IntakeSubmissionModule;
exports.IntakeSubmissionModule = IntakeSubmissionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([intake_submission_entity_1.IntakeSubmissionEntity])],
        controllers: [intake_submission_controller_1.IntakeSubmissionController],
        providers: [intake_submission_service_1.IntakeSubmissionService],
    })
], IntakeSubmissionModule);
//# sourceMappingURL=intake-submission.module.js.map