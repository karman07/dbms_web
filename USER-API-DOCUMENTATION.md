# User Management API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

**Note:** Firebase is only used for email verification. All API authentication uses JWT tokens returned from login/register.

---

## Auth Routes

### 1. Register User
**POST** `/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "referralSource": "google"
}
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login User
**POST** `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Firebase Login
**POST** `/auth/firebase-login`

**Body:**
```json
{
  "firebaseToken": "firebase-jwt-token",
  "isGoogleSignup": true
}
```

---

## User Routes

### 1. Create User
**POST** `/users`
- **Auth Required:** JWT Token
- **Access:** Any authenticated user

**Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "age": 25,
  "gender": "male",
  "currentPosition": "Software Developer",
  "company": "Tech Corp",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "referralSource": "google"
}
```

### 2. Create Admin
**POST** `/users/admin`
- **Auth Required:** None (for initial setup)
- **Access:** Public

**Body:**
```json
{
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "password": "admin123"
}
```

### 3. Get All Users
**GET** `/users`
- **Auth Required:** JWT Token
- **Access:** Admin only

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 4. Get User Profile
**GET** `/users/profile`
- **Auth Required:** JWT Token
- **Access:** Own profile only

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "age": 25,
  "gender": "male",
  "currentPosition": "Software Developer",
  "company": "Tech Corp",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "profilePicture": "https://example.com/pic.jpg",
  "bio": "Software developer with 5 years experience",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "role": "user",
  "firebaseUid": "firebase-uid-123",
  "isGoogleSignup": false,
  "referralSource": "google",
  "dateOfBirth": "1995-01-01T00:00:00.000Z",
  "linkedinProfile": "https://linkedin.com/in/johndoe",
  "githubProfile": "https://github.com/johndoe",
  "website": "https://johndoe.com",
  "isActive": true,
  "lastLoginAt": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 5. Get User by ID
**GET** `/users/:id`
- **Auth Required:** JWT Token
- **Access:** Admin only

**Response:** Same as profile response

### 6. Upload Profile Picture
**POST** `/users/profile/picture`
- **Auth Required:** JWT Token
- **Access:** Own profile only
- **Content-Type:** multipart/form-data

**Body (Form Data):**
- `profilePicture`: Image file (jpg, jpeg, png, gif, max 5MB)

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePicture": "/uploads/profile-pictures/profile-1234567890-123456789.jpg",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 7. Update Profile
**PATCH** `/users/profile`
- **Auth Required:** JWT Token
- **Access:** Own profile only

**Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phoneNumber": "+1987654321",
  "age": 26,
  "gender": "male",
  "currentPosition": "Senior Developer",
  "company": "New Tech Corp",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "bio": "Updated bio text",
  "dateOfBirth": "1995-01-01",
  "linkedinProfile": "https://linkedin.com/in/updated",
  "githubProfile": "https://github.com/updated",
  "website": "https://updated.com"
}
```

### 8. Admin Update User
**PATCH** `/users/:id`
- **Auth Required:** JWT Token
- **Access:** Admin only

**Body:**
```json
{
  "firstName": "Admin Updated",
  "lastName": "Name",
  "role": "admin",
  "isActive": true,
  "isEmailVerified": true,
  "isPhoneVerified": true
}
```

### 9. Delete User
**DELETE** `/users/:id`
- **Auth Required:** JWT Token
- **Access:** Admin only

**Response:** `204 No Content`

### 10. Verify Email
**PATCH** `/users/:id/verify-email`
- **Auth Required:** JWT Token
- **Access:** Admin only

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "isEmailVerified": true,
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

## User Schema Fields

### Required Fields
- `email` (string, unique)
- `firstName` (string, 2-50 chars)
- `lastName` (string, 2-50 chars)

### Optional Fields
- `password` (string, min 6 chars)
- `phoneNumber` (string, valid phone format)
- `age` (number)
- `gender` (enum: "male", "female", "other")
- `currentPosition` (string)
- `company` (string)
- `city` (string)
- `state` (string)
- `country` (string)
- `profilePicture` (string, URL)
- `bio` (string)
- `dateOfBirth` (date)
- `linkedinProfile` (string, URL)
- `githubProfile` (string, URL)
- `website` (string, URL)
- `referralSource` (string)

### System Fields
- `isEmailVerified` (boolean, default: false)
- `isPhoneVerified` (boolean, default: false)
- `role` (enum: "user", "admin", default: "user")
- `firebaseUid` (string)
- `isGoogleSignup` (boolean, default: false)
- `isActive` (boolean, default: true)
- `lastLoginAt` (date)
- `createdAt` (date, auto)
- `updatedAt` (date, auto)

---

## Error Responses

### 400 Bad Request
```json
{
  "message": ["email must be a valid email"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 401 Email Not Verified
```json
{
  "message": "Please verify your email before logging in",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 409 Conflict
```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```