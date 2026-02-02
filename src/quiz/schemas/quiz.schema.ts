import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class QuizOption {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
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
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, index: true })
  lessonId?: Types.ObjectId;

  @Prop({ type: [QuizQuestionSchema], required: true })
  questions: QuizQuestion[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.index({ lessonId: 1 });
