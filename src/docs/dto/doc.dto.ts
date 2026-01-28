import { IsString, IsNotEmpty, IsOptional, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubtopicDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string; // Markdown content
}

export class CreateDocTopicDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsOptional()
  @IsString()
  course?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateSubtopicDto)
  subtopics: CreateSubtopicDto[];
}

export class AddSubtopicDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
