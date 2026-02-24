"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudService = void 0;
const common_1 = require("@nestjs/common");
class CrudService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    parseSort(sortStr) {
        if (!sortStr)
            return {};
        const field = sortStr.startsWith('-') ? sortStr.slice(1) : sortStr;
        const direction = sortStr.startsWith('-') ? 'DESC' : 'ASC';
        return { [field]: direction };
    }
    list(sort, limit) {
        return this.repo.find({
            order: this.parseSort(sort),
            take: limit ?? 1000,
        });
    }
    filter(where, sort, limit) {
        return this.repo.find({
            where,
            order: this.parseSort(sort),
            take: limit ?? 1000,
        });
    }
    async get(id) {
        const entity = await this.repo.findOneBy({ id });
        if (!entity)
            throw new common_1.NotFoundException();
        return entity;
    }
    create(data) {
        const entity = this.repo.create(data);
        return this.repo.save(entity);
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.get(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.CrudService = CrudService;
//# sourceMappingURL=crud.service.js.map