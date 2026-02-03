import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  url: string;

  @Prop()
  filePath: string;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  thumbnailPath: string;

  @Prop()
  fileSize: number;

  @Prop()
  mimeType: string;

  @Prop({ required: true })
  uploadedBy: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
