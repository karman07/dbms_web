import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Assignment extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  content: string; // Markdown content

  @Prop({ type: Types.ObjectId, index: true })
  lessonId?: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  @Prop()
  maxScore?: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

AssignmentSchema.index({ lessonId: 1 });
