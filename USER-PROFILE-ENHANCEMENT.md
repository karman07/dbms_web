# User Profile Schema Enhancement - Changes Documentation

## Overview

Enhanced the user profile system to support two types of visitors: **Students** and **Teachers**. Each visitor type now has specific profile fields relevant to their role, along with a new endpoint to check profile completion status.

---

## Schema Changes

### File: `src/users/schemas/user.schema.ts`

#### New Enum Added

```typescript
export enum VisitorType {
  STUDENT = 'student',
  TEACHER = 'teacher',
}
```

#### New Fields Added to User Schema

**Common Field:**
- `visitorType?: VisitorType` - Identifies if user is a student or teacher

**Student-Specific Fields:**
- `studentId?: string` - Unique student ID (indexed, unique, sparse)
- `university?: string` - Name of university/college
- `degree?: string` - Degree type (Bachelor's, Master's, PhD, etc.)
- `major?: string` - Field of study/major
- `graduationYear?: number` - Expected or actual graduation year

**Teacher-Specific Fields:**
- `employeeId?: string` - Unique employee/faculty ID (indexed, unique, sparse)
- `department?: string` - Department name
- `designation?: string` - Job title/position (Professor, Lecturer, etc.)
- `teachingExperience?: number` - Years of teaching experience
- `specialization?: string[]` - Array of areas of expertise

#### New Database Indexes

```typescript
UserSchema.index({ visitorType: 1 });
UserSchema.index({ studentId: 1 });
UserSchema.index({ employeeId: 1 });
```

---

## DTO Changes

### File: `src/users/dto/user.dto.ts`

#### Import Update

```typescript
import { Gender, UserRole, VisitorType } from '../schemas/user.schema';
```

#### CreateUserDto - New Fields

All new fields added with proper validation:

```typescript
@IsOptional()
@IsEnum(VisitorType)
visitorType?: VisitorType;

// Student fields
@IsOptional()
@IsString()
studentId?: string;

@IsOptional()
@IsString()
university?: string;

@IsOptional()
@IsString()
degree?: string;

@IsOptional()
@IsString()
major?: string;

@IsOptional()
@IsNumber()
graduationYear?: number;

// Teacher fields
@IsOptional()
@IsString()
employeeId?: string;

@IsOptional()
@IsString()
department?: string;

@IsOptional()
@IsString()
designation?: string;

@IsOptional()
@IsNumber()
teachingExperience?: number;

@IsOptional()
@IsString({ each: true })
specialization?: string[];
```

#### UpdateUserDto - New Fields

Same fields added to `UpdateUserDto` for profile updates.

---

## Service Changes

### File: `src/users/services/users.service.ts`

#### New Method: `isProfileComplete()`

Checks if a user's profile is complete based on their visitor type.

```typescript
async isProfileComplete(id: string): Promise<{ isComplete: boolean; missingFields: string[] }>
```

**Logic:**
1. Checks basic required fields (common for all users):
   - phoneNumber
   - dateOfBirth
   - gender
   - city, state, country
   - bio
   - visitorType

2. Checks visitor-type specific fields:
   - **For Students**: studentId, university, degree, major, graduationYear
   - **For Teachers**: employeeId, department, designation, teachingExperience

**Returns:**
```typescript
{
  isComplete: boolean,
  missingFields: string[]
}
```

---

## Controller Changes

### File: `src/users/controllers/users.controller.ts`

#### New Endpoint: Check Profile Completion

```typescript
@Get('profile/is-complete')
@UseGuards(JwtAuthGuard)
checkProfileCompletion(@Request() req)
```

**Endpoint:** `GET /users/profile/is-complete`

**Authentication:** Required (JWT)

**Response Example:**
```json
{
  "isComplete": false,
  "missingFields": [
    "phoneNumber",
    "visitorType",
    "bio",
    "city"
  ]
}
```

---

## API Usage Examples

### 1. Create Student Profile

```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "visitorType": "student",
  "studentId": "STU2024001",
  "university": "MIT",
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "graduationYear": 2026,
  "phoneNumber": "+1234567890",
  "dateOfBirth": "2002-05-15",
  "gender": "male",
  "city": "Cambridge",
  "state": "Massachusetts",
  "country": "USA",
  "bio": "Passionate CS student interested in AI and ML"
}
```

### 2. Create Teacher Profile

```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "teacher@university.edu",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "visitorType": "teacher",
  "employeeId": "EMP2024001",
  "department": "Computer Science",
  "designation": "Associate Professor",
  "teachingExperience": 10,
  "specialization": ["Machine Learning", "Data Science", "AI"],
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1985-08-20",
  "gender": "female",
  "city": "Cambridge",
  "state": "Massachusetts",
  "country": "USA",
  "bio": "Experienced professor specializing in AI research"
}
```

### 3. Update Profile

```bash
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "university": "Stanford University",
  "major": "Artificial Intelligence",
  "bio": "Updated bio with more details"
}
```

### 4. Check Profile Completion

```bash
GET /users/profile/is-complete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isComplete": true,
  "missingFields": []
}
```

Or if incomplete:
```json
{
  "isComplete": false,
  "missingFields": [
    "phoneNumber",
    "visitorType",
    "studentId",
    "university"
  ]
}
```

---

## Field Requirements by Visitor Type

### Common Required Fields (All Users)
- ✅ email
- ✅ firstName
- ✅ lastName
- ✅ phoneNumber
- ✅ dateOfBirth
- ✅ gender
- ✅ city
- ✅ state
- ✅ country
- ✅ bio
- ✅ visitorType

### Student-Specific Required Fields
- ✅ studentId
- ✅ university
- ✅ degree
- ✅ major
- ✅ graduationYear

### Teacher-Specific Required Fields
- ✅ employeeId
- ✅ department
- ✅ designation
- ✅ teachingExperience

### Optional Fields (All Users)
- age
- currentPosition
- company
- profilePicture
- linkedinProfile
- githubProfile
- website
- referralSource

### Optional Fields (Teachers Only)
- specialization (array)

---

## Database Considerations

### Indexes Created
- `visitorType` - For filtering users by type
- `studentId` - For quick student lookup (unique, sparse)
- `employeeId` - For quick teacher lookup (unique, sparse)

### Backward Compatibility
- All new fields are optional
- Existing users without `visitorType` will continue to work
- Profile completion check will prompt them to set visitor type

---

## Testing Checklist

- [x] Schema updated with new enums and fields
- [x] DTOs updated with validation
- [x] Service method added for profile completion
- [x] Controller endpoint added
- [ ] Test student profile creation
- [ ] Test teacher profile creation
- [ ] Test profile update with new fields
- [ ] Test profile completion endpoint
- [ ] Verify backward compatibility with existing users
- [ ] Test unique constraints on studentId and employeeId

---

## Migration Notes

**No database migration required** - All new fields are optional and will be `null`/`undefined` for existing users.

Existing users should be prompted to:
1. Select their visitor type (student or teacher)
2. Fill in the relevant profile fields
3. Use the `/users/profile/is-complete` endpoint to check completion status

---

## Summary of Changes

| File | Changes |
|------|---------|
| `user.schema.ts` | Added VisitorType enum, 10 new fields, 3 new indexes |
| `user.dto.ts` | Added VisitorType import, 10 new validated fields in CreateUserDto and UpdateUserDto |
| `users.service.ts` | Added `isProfileComplete()` method |
| `users.controller.ts` | Added `GET /users/profile/is-complete` endpoint |

**Total New Fields:** 10 (5 for students, 4 for teachers, 1 common)

**New Endpoints:** 1 (`GET /users/profile/is-complete`)

**Breaking Changes:** None - all changes are backward compatible
