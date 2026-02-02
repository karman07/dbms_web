import { IsString, IsNotEmpty, IsArray, ValidateNested, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizOptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class QuizQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options: QuizOptionDto[];

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions?: QuizQuestionDto[];
}

export class SubmitQuizAnswerDto {
  @IsNumber()
  @Min(0)
  questionIndex: number;

  @IsNumber()
  @Min(0)
  selectedOptionIndex: number;
}

export class SubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizAnswerDto)
  answers: SubmitQuizAnswerDto[];
}
