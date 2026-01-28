import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (!admin.apps.length) {
      const serviceAccountPath = path.join(process.cwd(), 'dbms-website-ec1e6-firebase-adminsdk-fbsvc-23bb085f17.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId: 'dbms-website-ec1e6',
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