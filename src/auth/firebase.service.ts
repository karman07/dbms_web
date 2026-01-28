import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
        projectId,
      });
    }
  }

  async verifyIdToken(idToken: string) {
    return admin.auth().verifyIdToken(idToken);
  }

  async createUser(userData: any) {
    return admin.auth().createUser(userData);
  }

  async updateUser(uid: string, userData: any) {
    return admin.auth().updateUser(uid, userData);
  }

  async deleteUser(uid: string) {
    return admin.auth().deleteUser(uid);
  }
  /**
   * Sends a Firebase email verification link to the given email.
   * Returns the link (so you can send it via your own email service if needed).
   */
  async sendEmailVerification(email: string): Promise<string> {
    return admin.auth().generateEmailVerificationLink(email);
  }
  /**
   * Gets the Firebase user record by email.
   */
  async getUserByEmail(email: string) {
    return admin.auth().getUserByEmail(email);
  }
}