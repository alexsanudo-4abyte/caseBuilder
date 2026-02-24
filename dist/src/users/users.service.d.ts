import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<UserEntity>);
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>;
    create(data: Partial<UserEntity>): Promise<UserEntity>;
    update(id: string, data: Partial<UserEntity>): Promise<void>;
}
