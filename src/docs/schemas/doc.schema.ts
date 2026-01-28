import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DocSubtopic {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  content: string; // Markdown content

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DocSubtopicSchema = SchemaFactory.createForClass(DocSubtopic);

@Schema({ timestamps: true })
export class DocTopic extends Document {
  @Prop({ required: true })
  topic: string;

  @Prop({ default: 'dbms' })
  course: string;

  @Prop({ type: [DocSubtopicSchema], default: [] })
  subtopics: DocSubtopic[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DocTopicSchema = SchemaFactory.createForClass(DocTopic);
