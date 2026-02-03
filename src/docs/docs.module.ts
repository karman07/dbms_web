import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { DocTopic, DocTopicSchema } from './schemas/doc.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocTopic.name, schema: DocTopicSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService],
})
export class DocsModule {}
