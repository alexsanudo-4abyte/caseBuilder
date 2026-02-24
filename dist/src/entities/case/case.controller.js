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
exports.CaseController = void 0;
const common_1 = require("@nestjs/common");
const crud_controller_1 = require("../../shared/crud.controller");
const case_service_1 = require("./case.service");
let CaseController = class CaseController extends crud_controller_1.CrudController {
    constructor(service) {
        super(service);
    }
};
exports.CaseController = CaseController;
exports.CaseController = CaseController = __decorate([
    (0, common_1.Controller)('cases'),
    __metadata("design:paramtypes", [case_service_1.CaseService])
], CaseController);
//# sourceMappingURL=case.controller.js.map