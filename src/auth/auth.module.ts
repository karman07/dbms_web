import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [FirebaseService, JwtAuthGuard, RolesGuard, AuthService],
  exports: [FirebaseService, JwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule {}