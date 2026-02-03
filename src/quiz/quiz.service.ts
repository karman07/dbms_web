import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz } from './schemas/quiz.schema';
import { Course } from '../courses/schemas/course.schema';
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto } from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quizData: any = {
      title: createQuizDto.title,
      description: createQuizDto.description,
      questions: createQuizDto.questions,
    };
    
    if (createQuizDto.lessonId) {
      quizData.lessonId = new Types.ObjectId(createQuizDto.lessonId);
    }
    
    const quiz = new this.quizModel(quizData);
    return quiz.save();
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().exec();
  }

  async findById(quizId: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  async findByLessonId(lessonId: string): Promise<Quiz[]> {
    return this.quizModel.find({ lessonId: new Types.ObjectId(lessonId) }).exec();
  }

  async update(quizId: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findById(quizId);
    if (updateQuizDto.questions) {
      quiz.questions = updateQuizDto.questions as any;
    }
    return quiz.save();
  }

  async delete(quizId: string): Promise<void> {
    const result = await this.quizModel.findByIdAndDelete(quizId).exec();
    if (!result) {
      throw new NotFoundException('Quiz not found');
    }

    // Remove quiz ID from lessons that contain it
    try {
      await this.courseModel.updateMany(
        { 'sections.lessons.linkedQuizIds': new Types.ObjectId(quizId) },
        { $pull: { 'sections.$[].lessons.$[].linkedQuizIds': new Types.ObjectId(quizId) } },
      ).exec();
    } catch (e) {
      // ignore cleanup errors
    }
  }

  async linkToLesson(quizId: string, lessonId: string): Promise<Quiz> {
    const quiz = await this.findById(quizId);
    quiz.lessonId = new Types.ObjectId(lessonId);
    const saved = await quiz.save();

    // Also update the embedded lesson in the Course to maintain bidirectional link
    // Use atomic update to avoid version conflicts
    try {
      await this.courseModel.updateOne(
        {},
        { $addToSet: { 'sections.$[].lessons.$[l].linkedQuizIds': saved._id } },
        { arrayFilters: [{ 'l._id': new Types.ObjectId(lessonId) }] },
      ).exec();
    } catch (e) {
      // ignore update errors to avoid breaking linking operation
    }

    return saved;
  }

  async unlinkFromLesson(quizId: string): Promise<Quiz> {
    const quiz = await this.findById(quizId);
    quiz.lessonId = undefined;
    const saved = await quiz.save();

    // Remove link from course lesson if present using atomic update
    try {
      await this.courseModel.updateOne(
        {},
        { $pull: { 'sections.$[].lessons.$[l].linkedQuizIds': new Types.ObjectId(quizId) } },
        { arrayFilters: [{ 'l._id': { $exists: true } }] },
      ).exec();
    } catch (e) {
      // ignore errors
    }

    return saved;
  }

  async submitQuiz(userId: string, submitQuizDto: SubmitQuizDto): Promise<any> {
    const quiz = await this.findById(submitQuizDto.quizId);

    let correctAnswers = 0;
    const results = submitQuizDto.answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      if (!question) {
        return { questionIndex: answer.questionIndex, correct: false, explanation: 'Invalid question' };
      }

      const isCorrect = question.options[answer.selectedOptionIndex]?.isCorrect || false;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: answer.questionIndex,
        correct: isCorrect,
        explanation: question.explanation || 'No explanation provided'
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= 60;

    return {
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      passed,
      results
    };
  }
}
