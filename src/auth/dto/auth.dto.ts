import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  referralSource?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class FirebaseLoginDto {
  @IsString()
  firebaseToken: string;

  @IsOptional()
  @IsBoolean()
  isGoogleSignup?: boolean;
}