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
exports.IntakeSubmissionController = void 0;
const common_1 = require("@nestjs/common");
const crud_controller_1 = require("../../shared/crud.controller");
const intake_submission_service_1 = require("./intake-submission.service");
let IntakeSubmissionController = class IntakeSubmissionController extends crud_controller_1.CrudController {
    constructor(service) {
        super(service);
    }
};
exports.IntakeSubmissionController = IntakeSubmissionController;
exports.IntakeSubmissionController = IntakeSubmissionController = __decorate([
    (0, common_1.Controller)('intake-submissions'),
    __metadata("design:paramtypes", [intake_submission_service_1.IntakeSubmissionService])
], IntakeSubmissionController);
//# sourceMappingURL=intake-submission.controller.js.map