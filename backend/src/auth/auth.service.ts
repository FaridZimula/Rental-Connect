import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { SyncUserDto } from './dto/sync-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseAdminService,
  ) {}

  /**
   * Sync a Firebase-authenticated user into the Postgres database.
   * Called by the frontend after a successful Firebase sign-in.
   *
   * - If the user already exists (by firebase_uid), returns the existing record.
   * - If the user exists by email but has no firebase_uid (legacy user), links the accounts.
   * - If the user is brand new, creates a new Postgres record.
   */
  async syncUser(firebaseUid: string, firebaseEmail: string | undefined, dto: SyncUserDto) {
    // 1. Try to find by firebase_uid first (fast path)
    let user = await this.prisma.user.findUnique({
      where: { firebase_uid: firebaseUid },
    });

    if (user) {
      // Existing user — return their profile
      return this.formatUserResponse(user);
    }

    // 2. Try to find by email (handles legacy users migrating from password-based auth)
    if (firebaseEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: firebaseEmail },
      });

      if (user) {
        // Link the Firebase UID to the existing Postgres user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { firebase_uid: firebaseUid },
        });
        this.logger.log(`Linked Firebase UID ${firebaseUid} to existing user ${user.id}`);
        return this.formatUserResponse(user);
      }
    }

    // 3. Brand new user — create in Postgres
    const email = firebaseEmail || `${firebaseUid}@phone.rentalconnect.ug`;
    user = await this.prisma.user.create({
      data: {
        firebase_uid: firebaseUid,
        full_name: dto.full_name || 'User',
        email,
        phone: dto.phone,
        password_hash: '', // Not used with Firebase Auth
        role: dto.role || 'tenant',
        tos_accepted_at: new Date(),
        tos_version: '1.0',
      },
    });
    this.logger.log(`Created new user ${user.id} for Firebase UID ${firebaseUid}`);
    return this.formatUserResponse(user);
  }

  /**
   * Get user profile by Postgres user ID.
   */
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
        is_active: true,
        created_at: true,
      },
    });
  }

  /**
   * Update user profile (name, phone).
   */
  async updateProfile(userId: string, data: { full_name?: string; phone?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.full_name && { full_name: data.full_name }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        profile_image: true,
        is_verified: true,
      },
    });
    return { user: updated };
  }

  /**
   * Verify a raw Firebase ID token and sync the user.
   * Used by the /auth/sync endpoint before the guard is applied.
   */
  async verifyAndSync(idToken: string, dto: SyncUserDto) {
    try {
      const decoded = await this.firebase.verifyIdToken(idToken);
      return this.syncUser(decoded.uid, decoded.email, dto);
    } catch (error) {
      this.logger.warn(`Token verification failed during sync: ${error.message}`);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  private formatUserResponse(user: any) {
    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        profile_image: user.profile_image,
        is_verified: user.is_verified,
      },
    };
  }
}
