import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateClaimantProfileDto } from './dto/update-claimant-profile.dto';

const ALL_ROLES = [
  Role.ADMIN,
  Role.ATTORNEY,
  Role.INTAKE_STAFF,
  Role.CASE_MANAGER,
  Role.CLAIMANT,
];

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.full_name, dto.email, dto.password);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('register/claimant')
  async registerClaimant(@Body() dto: RegisterDto) {
    return this.authService.registerClaimant(
      dto.full_name,
      dto.email,
      dto.password,
    );
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Roles(...ALL_ROLES)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.userId);
  }

  @Roles(...ALL_ROLES)
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, dto);
  }

  @Roles(Role.CLAIMANT)
  @Patch('claimant-profile')
  updateClaimantProfile(@Req() req: any, @Body() dto: UpdateClaimantProfileDto) {
    return this.authService.updateClaimantProfile(req.user.userId, dto);
  }

  @Roles(...ALL_ROLES)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_, __, cb) => {
          const dir = join(process.cwd(), 'uploads', 'avatars');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_, file, cb) =>
          cb(null, `${crypto.randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.authService.uploadAvatar(req.user.userId, file.path);
  }

  @Roles(Role.CLAIMANT)
  @Get('my-submissions')
  mySubmissions(@Req() req: any) {
    return this.authService.mySubmissions(req.user.userId);
  }

  @Public()
  @Post('logout')
  logout() {
    return { ok: true };
  }
}
