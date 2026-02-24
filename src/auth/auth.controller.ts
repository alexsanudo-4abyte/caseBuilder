import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: { full_name: string; email: string; password: string }) {
    return this.authService.register(body.full_name, body.email, body.password);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.userId);
  }

  @Public()
  @Post('logout')
  logout() {
    return { ok: true };
  }
}
