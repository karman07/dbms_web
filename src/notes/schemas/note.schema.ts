import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NoteSource {
  QUIZ = 'quiz',
  DOCS = 'docs',
  ASSIGNMENT = 'assignment',
  CLASS_ACTIVITY = 'class_activity',
  COURSE = 'course',
  PERSONAL = 'personal',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ enum: NoteSource, required: true })
  source: NoteSource;

  @Prop()
  sourceDetails?: string;

  @Prop([String])
  tags: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: false })
  isBookmarked: boolean;

  @Prop({ default: false })
  isLiked: boolean;

  @Prop()
  attachments?: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

NoteSchema.index({ author: 1 });
NoteSchema.index({ source: 1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ isPublic: 1 });
NoteSchema.index({ createdAt: -1 });