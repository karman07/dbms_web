import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { UserProgress, UserProgressSchema } from './schemas/user-progress.schema';
import { AuthModule } from '../auth/auth.module';
import { Quiz, QuizSchema } from '../quiz/schemas/quiz.schema';
import { Assignment, AssignmentSchema } from '../assignment/schemas/assignment.schema';
import { ClassActivity, ClassActivitySchema } from '../class-activity/schemas/class-activity.schema';
import { DocTopic, DocTopicSchema } from '../docs/schemas/doc.schema';
import { DocSubtopic, DocSubtopicSchema } from '../docs/schemas/doc-subtopic.schema';
import { Media, MediaSchema } from '../media/schemas/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: ClassActivity.name, schema: ClassActivitySchema },
      { name: DocTopic.name, schema: DocTopicSchema },
      { name: DocSubtopic.name, schema: DocSubtopicSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
    AuthModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
