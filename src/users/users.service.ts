import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, AdminUpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const userData = {
      ...createUserDto,
      role: UserRole.ADMIN,
      isEmailVerified: true,
    };

    if (createUserDto.password) {
      userData.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const user = new this.userModel(userData);
    return user.save();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const userData = {
      ...createUserDto,
    };

    if (createUserDto.password) {
      userData.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const user = new this.userModel(userData);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userModel.findOne({ firebaseUid }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { ...updateUserDto, updatedAt: new Date() },
      { new: true }
    ).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async adminUpdate(id: string, adminUpdateUserDto: AdminUpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { ...adminUpdateUserDto, updatedAt: new Date() },
      { new: true }
    ).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isEmailVerified: true },
      { new: true }
    ).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfilePicture(id: string, filename: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { profilePicture: `/uploads/profile-pictures/${filename}`, updatedAt: new Date() },
      { new: true }
    ).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

}