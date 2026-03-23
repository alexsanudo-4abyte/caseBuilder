import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';
import { ClaimantEntity } from '../entities/claimant/claimant.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { hmac } from '../shared/crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    @InjectRepository(ClaimantEntity)
    private readonly claimantRepo: Repository<ClaimantEntity>,
    @InjectRepository(IntakeSubmissionEntity)
    private readonly submissionRepo: Repository<IntakeSubmissionEntity>,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(fullName: string, email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.users.create({
      full_name: fullName,
      email,
      password: hash,
      role: 'attorney',
    });
    return this.login(user);
  }

  async registerClaimant(fullName: string, email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.users.create({
      full_name: fullName,
      email,
      password: hash,
      role: 'claimant',
    });
    // Link any existing claimant record (from anonymous submission) to this user account
    const emailHash = hmac(email.toLowerCase());
    const claimant = await this.claimantRepo.findOne({
      where: { email_hash: emailHash },
    });
    if (claimant)
      await this.claimantRepo.update(claimant.id, { user_id: user.id });
    return this.login(user);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      firm_name: user.firm_name,
      office_address: user.office_address,
      avatar_url: user.avatar_url ?? null,
    };
  }

  async mySubmissions(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    // Try user_id FK first (set on register), fall back to email hash for legacy records
    let claimant = await this.claimantRepo.findOne({
      where: { user_id: userId },
    });
    if (!claimant) {
      const emailHash = hmac(user.email.toLowerCase());
      claimant = await this.claimantRepo.findOne({
        where: { email_hash: emailHash },
      });
      if (claimant)
        await this.claimantRepo.update(claimant.id, { user_id: userId });
    }
    if (!claimant) return [];
    return this.submissionRepo.find({
      where: { claimant_id: claimant.id },
      order: { created_date: 'DESC' },
    });
  }

  async uploadAvatar(userId: string, filePath: string) {
    const avatarUrl = `/uploads/avatars/${filePath.split('/').pop()}`;
    await this.users.update(userId, { avatar_url: avatarUrl } as any);
    return this.me(userId);
  }

  async updateClaimantProfile(
    userId: string,
    data: {
      full_name?: string;
      phone?: string;
      address?: string;
      date_of_birth?: string;
    },
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();

    // Resolve claimant record (same self-healing pattern as mySubmissions)
    let claimant = await this.claimantRepo.findOne({ where: { user_id: userId } });
    if (!claimant) {
      const emailHash = hmac(user.email.toLowerCase());
      claimant = await this.claimantRepo.findOne({ where: { email_hash: emailHash } });
      if (claimant)
        await this.claimantRepo.update(claimant.id, { user_id: userId });
    }
    if (!claimant) throw new BadRequestException('Claimant record not found');

    const updates: Partial<ClaimantEntity> = {};
    if (data.full_name !== undefined) updates.full_name = data.full_name;
    if (data.phone !== undefined) {
      updates.phone = data.phone;
      updates.phone_hash = data.phone ? hmac(data.phone) : '';
    }
    if (data.address !== undefined) updates.address = data.address;
    if (data.date_of_birth !== undefined) updates.date_of_birth = data.date_of_birth;

    await this.claimantRepo.update(claimant.id, updates);

    const updated = (await this.claimantRepo.findOne({ where: { id: claimant.id } }))!;
    return {
      full_name:     updated.full_name,
      email:         updated.email,
      phone:         updated.phone,
      address:       updated.address,
      date_of_birth: updated.date_of_birth,
    };
  }

  async updateProfile(
    userId: string,
    data: {
      full_name?: string;
      password?: string;
      phone?: string;
      firm_name?: string;
      office_address?: string;
    },
  ) {
    const updates: Partial<UserEntity> = {};
    if (data.full_name) updates.full_name = data.full_name;
    if (data.password) updates.password = await bcrypt.hash(data.password, 10);
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.firm_name !== undefined) updates.firm_name = data.firm_name;
    if (data.office_address !== undefined)
      updates.office_address = data.office_address;
    await this.users.update(userId, updates);
    return this.me(userId);
  }
}
