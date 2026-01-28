# User Profile Management API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All profile endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Profile Endpoints

### 1. Get User Profile
**GET** `/users/profile`

**Description:** Retrieve the authenticated user's complete profile information.

**Auth Required:** JWT Token  
**Access:** Own profile only

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
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
  "profilePicture": "/uploads/profile-pictures/profile-1234567890-123456789.jpg",
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

**Error Responses:**
- `401`: Invalid or missing token
- `404`: User not found

---

### 2. Update Profile
**PATCH** `/users/profile`

**Description:** Update the authenticated user's profile information.

**Auth Required:** JWT Token  
**Access:** Own profile only

**Request Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
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
  "bio": "Updated bio text with new information",
  "dateOfBirth": "1995-01-01",
  "linkedinProfile": "https://linkedin.com/in/updated",
  "githubProfile": "https://github.com/updated",
  "website": "https://updated.com"
}
```

**Validation Rules:**
- `firstName`: 2-50 characters (optional)
- `lastName`: 2-50 characters (optional)
- `phoneNumber`: Valid phone format (optional)
- `age`: Number (optional)
- `gender`: "male", "female", or "other" (optional)
- `dateOfBirth`: Valid date format (optional)
- `linkedinProfile`: Valid URL format (optional)
- `githubProfile`: Valid URL format (optional)
- `website`: Valid URL format (optional)

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "Updated",
  "lastName": "Name",
  "phoneNumber": "+1987654321",
  "age": 26,
  "currentPosition": "Senior Developer",
  "company": "New Tech Corp",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "bio": "Updated bio text with new information",
  "updatedAt": "2024-01-01T13:00:00.000Z"
}
```

**Error Responses:**
- `400`: Validation errors
- `401`: Invalid or missing token
- `404`: User not found

---

### 3. Upload Profile Picture
**POST** `/users/profile/picture`

**Description:** Upload and set a new profile picture for the authenticated user.

**Auth Required:** JWT Token  
**Access:** Own profile only

**Request Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `profilePicture`: Image file (jpg, jpeg, png, gif)

**File Restrictions:**
- **Max Size:** 5MB
- **Allowed Types:** jpg, jpeg, png, gif
- **Field Name:** `profilePicture`

**Success Response (200):**
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

**Error Responses:**
- `400`: Invalid file type or size
- `401`: Invalid or missing token
- `404`: User not found

**cURL Example:**
```bash
curl -X POST http://localhost:3000/users/profile/picture \
  -H "Authorization: Bearer <jwt-token>" \
  -F "profilePicture=@/path/to/image.jpg"
```

---

## Profile Schema

### Personal Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | User's first name (2-50 chars) |
| `lastName` | string | Yes | User's last name (2-50 chars) |
| `email` | string | Yes | User's email address (unique) |
| `phoneNumber` | string | No | Phone number in international format |
| `age` | number | No | User's age |
| `gender` | enum | No | "male", "female", or "other" |
| `dateOfBirth` | date | No | User's date of birth |

### Professional Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPosition` | string | No | Current job title/position |
| `company` | string | No | Current company name |
| `bio` | string | No | User's biography/description |

### Location Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `city` | string | No | Current city |
| `state` | string | No | Current state/province |
| `country` | string | No | Current country |

### Digital Presence
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profilePicture` | string | No | URL to profile picture |
| `linkedinProfile` | string | No | LinkedIn profile URL |
| `githubProfile` | string | No | GitHub profile URL |
| `website` | string | No | Personal website URL |

### System Fields (Read-Only)
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique user identifier |
| `role` | enum | User role ("user" or "admin") |
| `isEmailVerified` | boolean | Email verification status |
| `isPhoneVerified` | boolean | Phone verification status |
| `isActive` | boolean | Account active status |
| `firebaseUid` | string | Firebase user ID (if applicable) |
| `isGoogleSignup` | boolean | Google signup indicator |
| `referralSource` | string | How user found the platform |
| `lastLoginAt` | date | Last login timestamp |
| `createdAt` | date | Account creation timestamp |
| `updatedAt` | date | Last update timestamp |

---

## Validation Rules

### String Fields
- **firstName/lastName**: 2-50 characters, letters and spaces only
- **phoneNumber**: International format (+1234567890)
- **bio**: Maximum 500 characters
- **URLs**: Must be valid HTTP/HTTPS URLs

### File Upload
- **Profile Picture**: 
  - Formats: JPG, JPEG, PNG, GIF
  - Max Size: 5MB
  - Dimensions: Recommended 400x400px minimum

### Enum Values
- **gender**: "male", "female", "other"
- **role**: "user", "admin" (admin only can change)

---

## Error Handling

### 400 Bad Request - Validation Error
```json
{
  "message": [
    "firstName must be longer than or equal to 2 characters",
    "phoneNumber must be a valid phone number"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 400 Bad Request - File Upload Error
```json
{
  "message": "Only image files are allowed!",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "message": "Invalid token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 404 Not Found - User Not Found
```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Usage Examples

### JavaScript/Frontend Integration

#### Get Profile
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const profile = await response.json();
    console.log('User profile:', profile);
  }
};
```

#### Update Profile
```javascript
const updateProfile = async (profileData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/users/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  
  if (response.ok) {
    const updatedProfile = await response.json();
    console.log('Profile updated:', updatedProfile);
  }
};

// Usage
updateProfile({
  firstName: 'John',
  lastName: 'Updated',
  bio: 'New bio text'
});
```

#### Upload Profile Picture
```javascript
const uploadProfilePicture = async (file) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await fetch('/users/profile/picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('Profile picture updated:', result.profilePicture);
  }
};

// Usage with file input
const fileInput = document.getElementById('profilePicture');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadProfilePicture(file);
  }
});
```

---

## Best Practices

### Frontend Implementation
1. **Cache profile data** to reduce API calls
2. **Validate inputs** before sending requests
3. **Handle file size** before upload attempts
4. **Show loading states** during operations
5. **Implement proper error handling**

### Image Handling
1. **Compress images** before upload
2. **Show preview** before uploading
3. **Validate file types** on client-side
4. **Handle upload progress** for better UX

### Data Management
1. **Update local state** after successful API calls
2. **Implement optimistic updates** for better UX
3. **Sync profile data** across components
4. **Handle offline scenarios** gracefully

### Security Considerations
1. **Never expose sensitive fields** in frontend
2. **Validate all inputs** on both client and server
3. **Sanitize user inputs** to prevent XSS
4. **Use HTTPS** for all profile operations