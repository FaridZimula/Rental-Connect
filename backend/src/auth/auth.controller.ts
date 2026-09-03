import { Controller, Post, Get, Patch, Body, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/sync
   *
   * Called by the frontend after a successful Firebase sign-in (email, Google, or phone).
   * Verifies the Firebase ID token and upserts the user in Postgres.
   *
   * This endpoint does NOT use FirebaseAuthGuard because the user may not exist
   * in Postgres yet (first-time registration). It verifies the token manually.
   */
  @Post('sync')
  async sync(
    @Headers('authorization') authHeader: string,
    @Body() dto: SyncUserDto,
  ) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header');
    }
    const idToken = authHeader.split('Bearer ')[1];
    return this.authService.verifyAndSync(idToken, dto);
  }

  /**
   * GET /auth/me
   *
   * Returns the current user's profile. Requires a valid Firebase token
   * and an existing Postgres user record.
   */
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }

  /**
   * PATCH /auth/profile
   *
   * Allows authenticated users to update their full name and phone number.
   */
  @UseGuards(FirebaseAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }
}

