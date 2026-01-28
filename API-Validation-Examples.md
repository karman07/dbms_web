# API Validation Examples

## Auth Endpoints

### Register - Valid Request
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe", 
  "password": "password123",
  "referralSource": "google"
}
```

### Register - Invalid Request (Missing required fields)
```json
{
  "email": "invalid-email",
  "firstName": "J",
  "password": "123"
}
```
**Expected Error**: 400 Bad Request with validation errors

### Login - Valid Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Firebase Login - Valid Request
```json
{
  "firebaseToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "isGoogleSignup": true
}
```

## User Endpoints

### Create User - Valid Request
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "age": 25,
  "gender": "female",
  "currentPosition": "Developer",
  "company": "Tech Corp",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "referralSource": "linkedin"
}
```

### Update Profile - Valid Request
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "currentPosition": "Senior Developer",
  "bio": "Updated bio text",
  "linkedinProfile": "https://linkedin.com/in/user"
}
```

### Admin Update User - Valid Request
```json
{
  "role": "admin",
  "isActive": true,
  "isEmailVerified": true,
  "firstName": "Admin Updated Name"
}
```

## Validation Rules

- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **Names**: Minimum 2 characters, maximum 50
- **Phone**: Must be valid phone number format
- **Age**: Must be a number
- **Gender**: Must be "male", "female", or "other"
- **Role**: Must be "user" or "admin"
- **URLs**: Must be valid URL format (for social profiles)