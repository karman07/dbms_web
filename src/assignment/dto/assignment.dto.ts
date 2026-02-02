import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;
}
