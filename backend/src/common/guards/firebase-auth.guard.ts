import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase-admin.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard that verifies Firebase ID tokens from the Authorization header
 * and attaches the Postgres user record to the request.
 *
 * Replaces the old JwtAuthGuard (Passport-based).
 * All controllers that previously used JwtAuthGuard should use this instead.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private firebase: FirebaseAdminService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decoded = await this.firebase.verifyIdToken(idToken);

      // Look up the user in Postgres by firebase_uid
      const user = await this.prisma.user.findUnique({
        where: { firebase_uid: decoded.uid },
        select: { id: true, email: true, role: true, is_active: true },
      });

      if (!user) {
        throw new UnauthorizedException(
          'User not found in database. Please complete registration via /auth/sync.',
        );
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account has been disabled. Contact support.');
      }

      // Attach the Postgres user to the request (same shape as before)
      request.user = { id: user.id, email: user.email, role: user.role };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(`Firebase token verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
