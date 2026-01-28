import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { DocTopic, DocTopicSchema } from './schemas/doc.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DocTopic.name, schema: DocTopicSchema }])],
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService],
})
export class DocsModule {}
