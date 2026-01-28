import { MongooseModule } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import * as bcrypt from 'bcryptjs';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://karmanwork23_db_user:8813917626$Karman@cluster0.rf1epsi.mongodb.net/'),
    UsersModule,
    AuthModule,
  ],
})
class DebugModule {}

async function debugAdmin() {
  const app = await NestFactory.createApplicationContext(DebugModule);
  const usersService = app.get(UsersService);
  const authService = app.get(AuthService);

  try {
    // Check if admin exists
    const admin = await usersService.findByEmail('admin2@courseapp.com');
    if (!admin) {
      console.log('Admin not found in database');
      await app.close();
      return;
    }

    console.log('Admin found:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Has password:', !!admin.password);
    console.log('Password hash:', admin.password?.substring(0, 20) + '...');

    // Test password comparison
    if (admin.password) {
      const isValid = await bcrypt.compare('admin123456', admin.password);
      console.log('Password comparison result:', isValid);
    }

    // Test login
    try {
      const loginResult = await authService.login({
        email: 'admin2@courseapp.com',
        password: 'admin123456'
      });
      console.log('Login successful!');
      console.log('Token:', loginResult.token);
    } catch (error) {
      console.log('Login failed:', error.message);
    }

  } catch (error) {
    console.error('Debug error:', error);
  }

  await app.close();
}

debugAdmin();