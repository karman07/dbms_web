import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class LessonProgress {
  @Prop({ type: Types.ObjectId, required: true })
  lessonId: Types.ObjectId;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 0 })
  timeSpentMinutes: number;

  @Prop()
  lastAccessedAt?: Date;

  @Prop({ default: 0 })
  quizScore?: number; // Percentage 0-100

  @Prop({ default: 0 })
  quizAttempts?: number;
}

export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);

@Schema({ _id: false })
export class SectionProgress {
  @Prop({ type: Types.ObjectId, required: true })
  sectionId: Types.ObjectId;

  @Prop({ type: [LessonProgressSchema], default: [] })
  lessons: LessonProgress[];

  @Prop({ default: 0 })
  completedLessons: number;

  @Prop({ default: 0 })
  totalLessons: number;
}

export const SectionProgressSchema = SchemaFactory.createForClass(SectionProgress);

@Schema({ timestamps: true })
export class UserProgress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: [SectionProgressSchema], default: [] })
  sections: SectionProgress[];

  @Prop({ default: 0 })
  overallProgress: number; // Percentage 0-100

  @Prop()
  enrolledAt: Date;

  @Prop()
  lastAccessedAt: Date;

  @Prop({ default: 0 })
  totalTimeSpentMinutes: number;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);

// Create compound index for userId + courseId
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
