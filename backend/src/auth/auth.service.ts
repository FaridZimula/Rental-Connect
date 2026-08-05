import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        password_hash,
        role: dto.role,
        tos_accepted_at: new Date(),
        tos_version: '1.0',
        // Create credit wallet for every user
        credit_wallet: { create: { balance: 0 } },
      },
      select: { id: true, email: true, full_name: true, role: true, created_at: true },
    });

    const token = this.signToken(user.id, user.email, user.role as string);
    return { user, access_token: token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user.id, user.email, user.role as string);
    return {
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      access_token: token,
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        profile_image: true,
        is_verified: true,
        created_at: true,
      },
    });
  }

  private signToken(userId: string, email: string, role: string) {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: process.env.JWT_SECRET || 'fallback_secret',
        expiresIn: '7d',
      },
    );
  }
}
