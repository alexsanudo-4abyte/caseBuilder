import { Repository, FindOptionsWhere } from 'typeorm';
export declare abstract class CrudService<T extends {
    id: string;
}> {
    protected readonly repo: Repository<T>;
    constructor(repo: Repository<T>);
    private parseSort;
    list(sort?: string, limit?: number): Promise<T[]>;
    filter(where: FindOptionsWhere<T>, sort?: string, limit?: number): Promise<T[]>;
    get(id: string): Promise<T>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    remove(id: string): Promise<void>;
}
