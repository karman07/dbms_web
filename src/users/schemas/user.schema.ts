import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  password?: string;

  @Prop({ unique: true, sparse: true })
  phoneNumber?: string;

  @Prop()
  age?: number;

  @Prop({ enum: Gender })
  gender?: Gender;

  @Prop()
  currentPosition?: string;

  @Prop()
  company?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  country?: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  bio?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop()
  firebaseUid?: string;

  @Prop({ default: false })
  isGoogleSignup: boolean;

  @Prop()
  referralSource?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  linkedinProfile?: string;

  @Prop()
  githubProfile?: string;

  @Prop()
  website?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });