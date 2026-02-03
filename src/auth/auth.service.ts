import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FirebaseService } from './firebase.service';
import { RegisterDto, LoginDto, FirebaseLoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private firebaseService: FirebaseService,
  ) {}

  private generateToken(user: any) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '365d' }
    );
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // If isGoogleSignup is true, skip verification
    const isGoogleSignup = (registerDto as any).isGoogleSignup === true;

    const user = await this.usersService.create(registerDto);
    // No verification email is sent from backend. This is now handled on the frontend.
    const { password, ...result } = user.toObject();
    const token = this.generateToken(user);
    return { user: result, token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Always check Firebase email verification status for non-Google users
    if (!user.isGoogleSignup) {
      try {
        const firebaseUser = await this.firebaseService.getUserByEmail(user.email);
        if (!firebaseUser.emailVerified) {
          throw new UnauthorizedException('Please verify your email before logging in');
        }
      } catch (e) {
        // If Firebase user not found, fallback to local flag
        if (!user.isEmailVerified) {
          throw new UnauthorizedException('Please verify your email before logging in');
        }
      }
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user._id.toString());
    const { password, ...result } = user.toObject();
    const token = this.generateToken(user);
    return { user: result, token };
  }

  async firebaseLogin(firebaseLoginDto: FirebaseLoginDto) {
    const decodedToken = await this.firebaseService.verifyIdToken(firebaseLoginDto.firebaseToken);
    
    let user = await this.usersService.findByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      if (!decodedToken.email) {
        throw new UnauthorizedException('Email not provided by Firebase');
      }
      
      user = await this.usersService.create({
        email: decodedToken.email,
        firstName: decodedToken.name?.split(' ')[0] || 'User',
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
        firebaseUid: decodedToken.uid,
        isGoogleSignup: firebaseLoginDto.isGoogleSignup || false,
      });
    }

    await this.usersService.updateLastLogin(user._id.toString());
    const { password, ...result } = user.toObject();
    const token = this.generateToken(user);
    
    return { user: result, token, firebaseToken: firebaseLoginDto.firebaseToken };
  }
}