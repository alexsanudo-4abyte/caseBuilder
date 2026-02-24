import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    constructor(users: UsersService, jwt: JwtService);
    validateUser(email: string, password: string): Promise<UserEntity>;
    login(user: UserEntity): Promise<{
        access_token: string;
        user: {
            id: string;
            full_name: string;
            email: string;
            role: string;
        };
    }>;
    register(fullName: string, email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            full_name: string;
            email: string;
            role: string;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        full_name: string;
        email: string;
        role: string;
    }>;
}
