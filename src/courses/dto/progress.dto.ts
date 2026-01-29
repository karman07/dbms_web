import { IsMongoId, IsBoolean, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerDto {
  @IsNumber()
  questionIndex: number;

  @IsNumber()
  selectedOptionIndex: number;
}

export class SubmitQuizDto {
  @IsMongoId()
  sectionId: string;

  @IsMongoId()
  lessonId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}

export class UpdateProgressDto {
  @IsMongoId()
  sectionId: string;

  @IsMongoId()
  lessonId: string;

  @IsBoolean()
  completed: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpentMinutes?: number;
}

export class EnrollCourseDto {
  @IsMongoId()
  courseId: string;
}
