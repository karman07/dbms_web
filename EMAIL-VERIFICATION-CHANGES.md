# Email Verification on Registration (Non-Google Sign Up)

## Overview
This document describes the changes required to send a verification email upon user registration (if not using Google sign-in) and to prevent login until the email is verified. The implementation uses Firebase for sending emails.

## Requirements
- On user registration (except Google sign-in), send a verification email using Firebase.
- Prevent login for users whose email is not verified.

## Implementation Steps

### 1. Update Registration Logic
- In the registration endpoint/service, after creating a user (if not Google sign-in), trigger Firebase to send a verification email to the user's email address.

### 2. Update Login Logic
- During login, check if the user's email is verified (using Firebase user record).
- If not verified, deny login and return an appropriate error message.

### 3. Firebase Integration
- Use Firebase Admin SDK to send verification emails and check verification status.

## Example Code Changes

### Registration (Non-Google)
- After user creation, call:
  ```typescript
  await firebaseAdmin.auth().generateEmailVerificationLink(user.email);
  // Send this link to the user's email (via Firebase or custom email service)
  ```

### Login
- Before issuing JWT or session, check:
  ```typescript
  const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
  if (!userRecord.emailVerified) {
    throw new UnauthorizedException('Please verify your email before logging in.');
  }
  ```

## Files to Update
- `src/auth/auth.service.ts` (registration and login logic)
- `src/auth/firebase.service.ts` (add methods for sending verification email and checking verification status)

## Notes
- Ensure Google sign-in users are excluded from this flow (as Google accounts are already verified).
- Provide clear error messages to users who attempt to log in without verifying their email.
