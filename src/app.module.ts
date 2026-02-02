import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DocsModule } from './docs/docs.module';
import { NotesModule } from './notes/notes.module';
import { CoursesModule } from './courses/courses.module';
import { QuizModule } from './quiz/quiz.module';
import { AssignmentModule } from './assignment/assignment.module';
import { ClassActivityModule } from './class-activity/class-activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DocsModule,
    NotesModule,
    CoursesModule,
    QuizModule,
    AssignmentModule,
    ClassActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
