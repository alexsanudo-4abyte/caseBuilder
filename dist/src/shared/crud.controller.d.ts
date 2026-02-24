import { CrudService } from './crud.service';
export declare abstract class CrudController<T extends {
    id: string;
}> {
    private readonly service;
    constructor(service: CrudService<T>);
    findAll(query: Record<string, string>): Promise<T[]>;
    findOne(id: string): Promise<T>;
    create(body: Partial<T>): Promise<T>;
    update(id: string, body: Partial<T>): Promise<T>;
    remove(id: string): Promise<void>;
}
