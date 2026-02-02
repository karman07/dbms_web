import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClassActivity extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  content: string; // Markdown content

  @Prop({ type: Types.ObjectId, index: true })
  lessonId?: Types.ObjectId;

  @Prop()
  duration?: number; // Duration in minutes

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ClassActivitySchema = SchemaFactory.createForClass(ClassActivity);

ClassActivitySchema.index({ lessonId: 1 });
