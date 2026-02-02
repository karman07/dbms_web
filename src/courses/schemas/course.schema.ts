import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class QuizOption {
  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  isCorrect: boolean;
}

export const QuizOptionSchema = SchemaFactory.createForClass(QuizOption);

@Schema({ _id: false })
export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [QuizOptionSchema], required: true })
  options: QuizOption[];

  @Prop()
  explanation?: string;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

@Schema({ timestamps: true })
export class Lesson {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string; // Markdown content or HTML

  @Prop({ default: 0 })
  order: number;

  @Prop()
  videoUrl?: string;

  @Prop()
  videoDescription?: string;

  @Prop({ type: [String], default: [] })
  resources: string[]; // URLs or file paths

  @Prop({ type: [QuizQuestionSchema], default: [] })
  quiz: QuizQuestion[];

  // Instead of embedding markdown `content`, lessons now reference a DocSubtopic document
  @Prop({ type: Types.ObjectId, ref: 'DocSubtopic' })
  docSubtopicId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Quiz', default: [] })
  linkedQuizIds?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Assignment', default: [] })
  linkedAssignmentIds?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'ClassActivity', default: [] })
  linkedActivityIds?: Types.ObjectId[];

  @Prop({ default: 0 })
  estimatedMinutes: number;

  @Prop({ default: false })
  isPublished: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema({ timestamps: true })
export class Section {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [LessonSchema], default: [] })
  lessons: Lesson[];
}

export const SectionSchema = SchemaFactory.createForClass(Section);

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  thumbnail?: string;

  @Prop({ type: [SectionSchema], default: [] })
  sections: Section[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  enrolledCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
