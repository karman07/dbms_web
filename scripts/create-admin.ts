import { MongooseModule } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '../src/users/schemas/user.schema';
import * as jwt from 'jsonwebtoken';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://karmanwork23_db_user:8813917626$Karman@cluster0.rf1epsi.mongodb.net/'),
    UsersModule,
  ],
})
class ScriptModule {}

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(ScriptModule);
  const usersService = app.get(UsersService);

  const adminData = {
    email: 'admin2@courseapp.com',
    firstName: 'Super',
    lastName: 'Admin',
    password: 'admin123456',
    role: UserRole.ADMIN,
  };

  try {
    const admin = await usersService.createAdmin(adminData);
    console.log('Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Password hash exists:', !!admin.password);
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Admin JWT Token:', token);
    console.log('\nUse this token in Postman Authorization header as: Bearer ' + token);
    console.log('\nLogin credentials:');
    console.log('Email: admin2@courseapp.com');
    console.log('Password: admin123456');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Admin already exists, trying to get existing admin...');
      const existingAdmin = await usersService.findByEmail(adminData.email);
      if (existingAdmin) {
        const token = jwt.sign(
          { id: existingAdmin._id, email: existingAdmin.email, role: existingAdmin.role },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        console.log('Existing Admin JWT Token:', token);
      }
    } else {
      console.error('Error creating admin:', error);
    }
  }

  await app.close();
}

createAdmin();