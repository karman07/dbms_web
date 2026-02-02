import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassActivityController } from './class-activity.controller';
import { ClassActivityService } from './class-activity.service';
import { ClassActivity, ClassActivitySchema } from './schemas/class-activity.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassActivity.name, schema: ClassActivitySchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [ClassActivityController],
  providers: [ClassActivityService],
  exports: [ClassActivityService],
})
export class ClassActivityModule {}
