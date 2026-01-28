import { MongooseModule } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '../src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://karmanwork23_db_user:8813917626$Karman@cluster0.rf1epsi.mongodb.net/'),
    UsersModule,
    AuthModule,
  ],
})
class TestModule {}

async function createAndTestAdmin() {
  const app = await NestFactory.createApplicationContext(TestModule);
  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);

  const adminEmail = 'admin@test.com';
  const adminPassword = 'admin123';

  try {
    // Delete existing admin if exists
    const existing = await usersService.findByEmail(adminEmail);
    if (existing) {
      await usersService.remove(existing._id.toString());
      console.log('Deleted existing admin');
    }

    // Create admin using register (which properly hashes password)
    const registerResult = await authService.register({
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
    });

    // Update role to admin
    await usersService.adminUpdate(registerResult.user._id, { role: UserRole.ADMIN });
    
    console.log('Admin created via register method');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

    // Test login
    const loginResult = await authService.login({
      email: adminEmail,
      password: adminPassword,
    });

    console.log('✅ Login successful!');
    console.log('JWT Token:', loginResult.token);
    console.log('User Role:', loginResult.user.role);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await app.close();
}

createAndTestAdmin();