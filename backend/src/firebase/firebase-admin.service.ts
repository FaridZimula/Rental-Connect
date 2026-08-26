import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);

  onModuleInit() {
    if (admin.apps.length > 0) return;

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountPath) {
      // Use service account JSON file
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.logger.log('Firebase Admin initialized with service account file');
    } else if (projectId) {
      // Use project ID with default credentials (for cloud deployments)
      admin.initializeApp({
        projectId,
      });
      this.logger.log(`Firebase Admin initialized with project ID: ${projectId}`);
    } else {
      this.logger.warn(
        'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID env var.',
      );
      admin.initializeApp();
    }
  }

  /**
   * Verify a Firebase ID token and return the decoded token.
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(idToken);
  }

  /**
   * Get a Firebase user record by UID.
   */
  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    return admin.auth().getUser(uid);
  }

  /**
   * Create a Firebase user (for admin seeding / migration).
   */
  async createUser(properties: admin.auth.CreateRequest): Promise<admin.auth.UserRecord> {
    return admin.auth().createUser(properties);
  }
}
