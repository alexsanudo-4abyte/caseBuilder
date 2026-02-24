import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        full_name: string;
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            full_name: string;
            email: string;
            role: string;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            full_name: string;
            email: string;
            role: string;
        };
    }>;
    me(req: any): Promise<{
        id: string;
        full_name: string;
        email: string;
        role: string;
    }>;
    updateProfile(req: any, body: {
        full_name?: string;
        password?: string;
    }): Promise<{
        id: string;
        full_name: string;
        email: string;
        role: string;
    }>;
    logout(): {
        ok: boolean;
    };
}
