import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(): {
        ok: boolean;
    };
}
