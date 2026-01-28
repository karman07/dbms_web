# Profile API Documentation

## Overview
This document outlines all the API endpoints for user profile management in the application.

## Base URL
```
https://api.yourapp.com/v1
```

## Authentication
All profile endpoints require authentication via Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get User Profile
**GET** `/profile`

Retrieves the current user's profile information.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "profilePicture": "https://example.com/avatar.jpg",
    "bio": "Software developer passionate about technology",
    "github": "johndoe",
    "linkedin": "johndoe",
    "website": "https://johndoe.com",
    "city": "New York",
    "state": "NY",
    "country": "United States",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

### 2. Update User Profile
**PUT** `/profile`

Updates the current user's profile information.

#### Request Body
```json
{
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "bio": "Software developer passionate about technology",
  "github": "johndoe",
  "linkedin": "johndoe",
  "website": "https://johndoe.com",
  "city": "New York",
  "state": "NY",
  "country": "United States"
}
```

#### Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "bio": "Software developer passionate about technology",
    "github": "johndoe",
    "linkedin": "johndoe",
    "website": "https://johndoe.com",
    "city": "New York",
    "state": "NY",
    "country": "United States",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Validation Errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format",
      "phone": "Invalid phone number format",
      "dateOfBirth": "Date must be in YYYY-MM-DD format"
    }
  }
}
```

---

### 3. Upload Profile Picture
**POST** `/profile/avatar`

Uploads a new profile picture for the user.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `avatar` file field

#### Response
```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "data": {
    "profilePicture": "https://example.com/avatars/user_123_1642234567.jpg",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size must be less than 5MB"
  }
}
```

---

### 4. Delete Profile Picture
**DELETE** `/profile/avatar`

Removes the user's profile picture.

#### Response
```json
{
  "success": true,
  "message": "Profile picture removed successfully",
  "data": {
    "profilePicture": null,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. Change Password
**PUT** `/profile/password`

Changes the user's password.

#### Request Body
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

#### Response
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Current password is incorrect"
  }
}
```

---

### 6. Update Email
**PUT** `/profile/email`

Updates the user's email address (requires email verification).

#### Request Body
```json
{
  "newEmail": "newemail@example.com",
  "password": "currentpassword123"
}
```

#### Response
```json
{
  "success": true,
  "message": "Verification email sent to newemail@example.com",
  "data": {
    "pendingEmail": "newemail@example.com",
    "verificationRequired": true
  }
}
```

---

### 7. Verify Email Change
**POST** `/profile/email/verify`

Verifies the email change using the verification token.

#### Request Body
```json
{
  "token": "verification_token_here"
}
```

#### Response
```json
{
  "success": true,
  "message": "Email updated successfully",
  "data": {
    "email": "newemail@example.com",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 8. Delete Account
**DELETE** `/profile`

Permanently deletes the user's account and all associated data.

#### Request Body
```json
{
  "password": "currentpassword123",
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

#### Response
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required or invalid token |
| `FORBIDDEN` | User doesn't have permission for this action |
| `VALIDATION_ERROR` | Invalid input data |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | Unsupported file format |
| `INVALID_PASSWORD` | Current password is incorrect |
| `EMAIL_ALREADY_EXISTS` | Email is already in use by another account |
| `RATE_LIMIT_EXCEEDED` | Too many requests, try again later |
| `INTERNAL_ERROR` | Server error occurred |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `GET /profile` | 100 requests per minute |
| `PUT /profile` | 10 requests per minute |
| `POST /profile/avatar` | 5 requests per minute |
| `PUT /profile/password` | 3 requests per minute |
| `PUT /profile/email` | 3 requests per minute |

---

## File Upload Specifications

### Profile Picture
- **Supported formats**: JPG, PNG, GIF, WebP
- **Maximum size**: 5MB
- **Recommended dimensions**: 400x400px (square)
- **Auto-processing**: Images are automatically resized and optimized

---

## Data Validation Rules

### Personal Information
- **displayName**: 2-50 characters, letters, numbers, spaces, hyphens, apostrophes
- **firstName/lastName**: 1-30 characters, letters, spaces, hyphens, apostrophes
- **phone**: Valid international phone number format
- **dateOfBirth**: YYYY-MM-DD format, user must be 13+ years old
- **gender**: One of: male, female, other, prefer_not_to_say

### Social Links
- **github**: Valid GitHub username (3-39 characters, alphanumeric and hyphens)
- **linkedin**: Valid LinkedIn username or profile URL
- **website**: Valid URL with http/https protocol

### Location
- **city**: 1-50 characters
- **state**: 1-50 characters
- **country**: 1-50 characters

### Bio
- **bio**: Maximum 500 characters

---

## Security Notes

1. All endpoints require valid JWT authentication
2. Password changes invalidate all existing sessions
3. Email changes require verification via email
4. Account deletion is irreversible
5. Profile pictures are scanned for malicious content
6. Rate limiting prevents abuse
7. All data is encrypted in transit and at rest