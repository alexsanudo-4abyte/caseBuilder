"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const case_entity_1 = require("./case.entity");
const case_controller_1 = require("./case.controller");
const case_service_1 = require("./case.service");
let CaseModule = class CaseModule {
};
exports.CaseModule = CaseModule;
exports.CaseModule = CaseModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([case_entity_1.CaseEntity])],
        controllers: [case_controller_1.CaseController],
        providers: [case_service_1.CaseService],
    })
], CaseModule);
//# sourceMappingURL=case.module.js.map