import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, MinLength, MaxLength } from 'class-validator';
import { NoteSource } from '../schemas/note.schema';

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(NoteSource)
  source: NoteSource;

  @IsOptional()
  @IsString()
  sourceDetails?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsEnum(NoteSource)
  source?: NoteSource;

  @IsOptional()
  @IsString()
  sourceDetails?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}