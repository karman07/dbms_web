# User Authentication API Documentation

## Base URL
```
http://localhost:3000
```

## Overview
This API provides comprehensive user authentication with JWT tokens, email verification, and Firebase integration for social login.

---

## Authentication Flow

### 1. **Registration Flow**
1. User registers with email/password
2. Account created with `isEmailVerified: false`
3. JWT token returned for immediate access
4. Email verification required for full access

### 2. **Login Flow**
1. User provides email/password
2. System validates credentials
3. Checks if email is verified
4. Returns JWT token if successful
5. Updates last login timestamp

### 3. **Firebase/Social Login Flow**
1. User authenticates with Firebase (Google, etc.)
2. Firebase token sent to backend
3. System verifies Firebase token
4. Creates user if doesn't exist
5. Returns JWT token for API access

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Description:** Create a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "referralSource": "google"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `firstName`: 2-50 characters
- `lastName`: 2-50 characters  
- `password`: Minimum 6 characters
- `referralSource`: Optional string

**Success Response (201):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isEmailVerified": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDEwODE2MDB9.example"
}
```

**Error Responses:**
- `400`: Validation errors
- `409`: Email already exists

---

### 2. Login User
**POST** `/auth/login`

**Description:** Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Valid email format
- `password`: Required string

**Success Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isEmailVerified": true,
    "lastLoginAt": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401`: Invalid credentials
- `401`: Email not verified
- `401`: Account inactive

---

### 3. Firebase/Social Login
**POST** `/auth/firebase-login`

**Description:** Authenticate user with Firebase token (Google, Facebook, etc.).

**Request Body:**
```json
{
  "firebaseToken": "firebase-jwt-token-here",
  "isGoogleSignup": true
}
```

**Validation Rules:**
- `firebaseToken`: Valid Firebase JWT token
- `isGoogleSignup`: Optional boolean

**Success Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isEmailVerified": true,
    "isGoogleSignup": true,
    "firebaseUid": "firebase-uid-123"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "firebaseToken": "firebase-jwt-token-here"
}
```

**Error Responses:**
- `401`: Invalid Firebase token
- `401`: Email not provided by Firebase

---

## JWT Token Details

### Token Structure
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com", 
  "role": "user",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Token Usage
Include JWT token in Authorization header for protected endpoints:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- **Duration:** 24 hours
- **Refresh:** Login again to get new token
- **Security:** Tokens are stateless and cannot be revoked

---

## Email Verification

### Verification Status
- **New users:** `isEmailVerified: false`
- **Firebase users:** `isEmailVerified: true` (auto-verified)
- **Admin users:** `isEmailVerified: true` (auto-verified)

### Verification Requirement
- **Login:** Blocked if email not verified
- **API Access:** Allowed with JWT token
- **Admin Override:** Admins can verify any user's email

### Verification Endpoint
**PATCH** `/users/:id/verify-email` (Admin only)

---

## Role-Based Access Control

### User Roles
- **user**: Default role, limited access
- **admin**: Full access to all endpoints

### Role Permissions
| Endpoint | User | Admin |
|----------|------|-------|
| Own Profile | ✅ | ✅ |
| All Users | ❌ | ✅ |
| Update Any User | ❌ | ✅ |
| Delete Users | ❌ | ✅ |
| Verify Emails | ❌ | ✅ |

### Role Assignment
- **Registration:** Always creates "user" role
- **Admin Creation:** Use `/users/admin` endpoint
- **Role Update:** Admin can change user roles

---

## Security Features

### Password Security
- **Hashing:** bcrypt with salt rounds (10)
- **Validation:** Minimum 6 characters
- **Storage:** Never returned in API responses

### Token Security
- **Algorithm:** HS256 (HMAC SHA-256)
- **Secret:** Environment variable `JWT_SECRET`
- **Expiration:** 24 hours
- **Validation:** Required for protected endpoints

### Input Validation
- **Sanitization:** Whitelist allowed fields
- **Type Checking:** Automatic type conversion
- **Format Validation:** Email, phone, URL formats

### Rate Limiting
- **Recommendation:** Implement rate limiting for auth endpoints
- **Brute Force:** Consider account lockout after failed attempts

---

## Error Handling

### Authentication Errors

#### 400 Bad Request
```json
{
  "message": [
    "email must be a valid email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### 401 Unauthorized - Invalid Credentials
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

#### 401 Unauthorized - Email Not Verified
```json
{
  "message": "Please verify your email before logging in",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "message": "Invalid token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### 409 Conflict - User Exists
```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

---

## Integration Examples

### Frontend Login Flow
```javascript
// 1. Login request
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { user, token } = await response.json();

// 2. Store token
localStorage.setItem('authToken', token);

// 3. Use token for API calls
const profileResponse = await fetch('/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Firebase Integration
```javascript
// 1. Firebase authentication
const firebaseUser = await signInWithPopup(auth, googleProvider);
const firebaseToken = await firebaseUser.getIdToken();

// 2. Backend authentication
const response = await fetch('/auth/firebase-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firebaseToken,
    isGoogleSignup: true
  })
});

const { user, token } = await response.json();
```

---

## Best Practices

### Client-Side
1. **Store tokens securely** (httpOnly cookies preferred)
2. **Handle token expiration** gracefully
3. **Validate responses** before storing user data
4. **Implement logout** by removing stored tokens

### Server-Side
1. **Use HTTPS** in production
2. **Rotate JWT secrets** regularly
3. **Implement rate limiting** on auth endpoints
4. **Log authentication events** for security monitoring

### Security Considerations
1. **Never log passwords** or tokens
2. **Validate all inputs** on server-side
3. **Use strong JWT secrets** (256+ bits)
4. **Consider refresh tokens** for long-lived sessions