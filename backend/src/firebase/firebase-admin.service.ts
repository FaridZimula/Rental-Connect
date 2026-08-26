import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken, UserRecord, CreateRequest } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app!: App;
  private auth!: Auth;

  onModuleInit() {
    if (getApps().length > 0) {
      this.app = getApps()[0];
      this.auth = getAuth(this.app);
      return;
    }

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require(serviceAccountPath);
      this.app = initializeApp({
        credential: cert(serviceAccount),
      });
      this.logger.log('Firebase Admin initialized with service account file');
    } else if (projectId) {
      this.app = initializeApp({
        projectId,
      });
      this.logger.log(`Firebase Admin initialized with project ID: ${projectId}`);
    } else {
      this.logger.warn(
        'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID env var.',
      );
      this.app = initializeApp();
    }

    this.auth = getAuth(this.app);
  }

  /**
   * Verify a Firebase ID token and return the decoded token.
   */
  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    return this.auth.verifyIdToken(idToken);
  }

  /**
   * Get a Firebase user record by UID.
   */
  async getUser(uid: string): Promise<UserRecord> {
    return this.auth.getUser(uid);
  }

  /**
   * Create a Firebase user (for admin seeding / migration).
   */
  async createUser(properties: CreateRequest): Promise<UserRecord> {
    return this.auth.createUser(properties);
  }
}
