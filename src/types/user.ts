// User types and interfaces

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  currentPosition?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  website?: string;
  visitorType?: 'student' | 'teacher';
  // Student fields
  university?: string;
  degree?: string;
  major?: string;
  graduationYear?: number;
  // Teacher fields
  department?: string;
  designation?: string;
  teachingExperience?: number;
  specialization?: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: 'user' | 'admin';
  firebaseUid?: string;
  isGoogleSignup: boolean;
  referralSource?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  referralSource?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface FirebaseLoginDto {
  firebaseToken: string;
  isGoogleSignup?: boolean;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  currentPosition?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  referralSource?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  currentPosition?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  dateOfBirth?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  website?: string;
  visitorType?: 'student' | 'teacher';
  // Student fields
  university?: string;
  degree?: string;
  major?: string;
  graduationYear?: number;
  // Teacher fields
  department?: string;
  designation?: string;
  teachingExperience?: number;
  specialization?: string[];
}

export interface AdminUpdateUserDto extends UpdateProfileDto {
  role?: 'user' | 'admin';
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}
