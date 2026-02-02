import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DocSubtopic extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DocSubtopicSchema = SchemaFactory.createForClass(DocSubtopic);
