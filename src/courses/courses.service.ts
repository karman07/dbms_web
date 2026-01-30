import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from './schemas/course.schema';
import { UserProgress } from './schemas/user-progress.schema';
import { CreateCourseDto, UpdateCourseDto, CreateSectionDto, UpdateSectionDto, CreateLessonDto, UpdateLessonDto } from './dto/course.dto';
import { UpdateProgressDto, SubmitQuizDto } from './dto/progress.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(UserProgress.name) private userProgressModel: Model<UserProgress>,
  ) {}

  // Helper: Get the single course
  private async getCourseSingle(): Promise<Course> {
    const course = await this.courseModel.findOne();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  // Admin: Create a new course (only once)
  async createCourse(createCourseDto: CreateCourseDto, adminId: string): Promise<Course> {
    const existing = await this.courseModel.findOne();
    if (existing) {
      throw new BadRequestException('Course already exists. Please update instead of creating.');
    }
    const course = new this.courseModel({
      ...createCourseDto,
      createdBy: new Types.ObjectId(adminId),
    });
    return course.save();
  }

  // Admin: Update course
  async updateCourse(updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.getCourseSingle();
    Object.assign(course, updateCourseDto);
    return course.save();
  }

  // Admin: Add section to course
  async addSection(createSectionDto: CreateSectionDto): Promise<Course> {
    const course = await this.getCourseSingle();
    course.sections.push(createSectionDto as any);
    return course.save();
  }

  // Admin: Update section
  async updateSection(sectionIndex: number, updateSectionDto: UpdateSectionDto): Promise<Course> {
    const course = await this.getCourseSingle();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (sectionIndex < 0 || sectionIndex >= course.sections.length) {
      throw new BadRequestException('Invalid section index');
    }
    Object.assign(course.sections[sectionIndex], updateSectionDto);
    return course.save();
  }

  // Admin: Delete section
  async deleteSection(sectionIndex: number): Promise<Course> {
    const course = await this.getCourseSingle();
    if (sectionIndex < 0 || sectionIndex >= course.sections.length) {
      throw new BadRequestException('Invalid section index');
    }
    course.sections.splice(sectionIndex, 1);
    return course.save();
  }

  // Admin: Add lesson to section
  async addLesson(sectionIndex: number, createLessonDto: CreateLessonDto): Promise<Course> {
    const course = await this.getCourseSingle();
    if (sectionIndex < 0 || sectionIndex >= course.sections.length) {
      throw new BadRequestException('Invalid section index');
    }
    course.sections[sectionIndex].lessons.push(createLessonDto as any);
    return course.save();
  }

  // Admin: Update lesson
  async updateLesson(sectionIndex: number, lessonIndex: number, updateLessonDto: UpdateLessonDto): Promise<Course> {
    const course = await this.getCourseSingle();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (sectionIndex < 0 || sectionIndex >= course.sections.length) {
      throw new BadRequestException('Invalid section index');
    }
    const section = course.sections[sectionIndex];
    if (lessonIndex < 0 || lessonIndex >= section.lessons.length) {
      throw new BadRequestException('Invalid lesson index');
    }
    Object.assign(section.lessons[lessonIndex], updateLessonDto);
    return course.save();
  }

  // Admin: Delete lesson
  async deleteLesson(sectionIndex: number, lessonIndex: number): Promise<Course> {
    const course = await this.getCourseSingle();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (sectionIndex < 0 || sectionIndex >= course.sections.length) {
      throw new BadRequestException('Invalid section index');
    }
    const section = course.sections[sectionIndex];
    if (lessonIndex < 0 || lessonIndex >= section.lessons.length) {
      throw new BadRequestException('Invalid lesson index');
    }
    section.lessons.splice(lessonIndex, 1);
    return course.save();
  }

  // Public: Get published course
  async getPublishedCourse(): Promise<Course> {
    const course = await this.courseModel.findOne({ isPublished: true });
    if (!course) {
      throw new NotFoundException('Course not found or not published');
    }
    return course;
  }

  // Admin: Get course (including unpublished)
  async getCourseAdmin(): Promise<Course> {
    return this.getCourseSingle();
  }

  // User: Enroll in course
  async enrollInCourse(userId: string): Promise<UserProgress> {
    const course = await this.courseModel.findOne();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (!course.isPublished) {
      throw new ForbiddenException('Course is not published yet');
    }

    // Check if already enrolled
    const existingProgress = await this.userProgressModel.findOne({
      userId: new Types.ObjectId(userId),
      courseId: course._id,
    });
    if (existingProgress) {
      return existingProgress;
    }

    // Initialize progress structure
    const sections = course.sections.map((section: any) => ({
      sectionId: section._id,
      lessons: section.lessons.map((lesson: any) => ({
        lessonId: lesson._id,
        completed: false,
        timeSpentMinutes: 0,
      })),
      completedLessons: 0,
      totalLessons: section.lessons.length,
    }));

    const progress = new this.userProgressModel({
      userId: new Types.ObjectId(userId),
      courseId: course._id,
      sections,
      overallProgress: 0,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
      totalTimeSpentMinutes: 0,
    });

    await progress.save();

    // Increment enrolled count
    await this.courseModel.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });

    return progress;
  }

  // User: Update progress
  async updateProgress(userId: string, updateProgressDto: UpdateProgressDto): Promise<UserProgress> {
    const course = await this.courseModel.findOne();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const progress = await this.userProgressModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!progress) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    const sectionProgress = progress.sections.find(
      (s) => s.sectionId.toString() === updateProgressDto.sectionId,
    );
    if (!sectionProgress) {
      throw new BadRequestException('Section not found in progress');
    }

    const lessonProgress = sectionProgress.lessons.find(
      (l) => l.lessonId.toString() === updateProgressDto.lessonId,
    );
    if (!lessonProgress) {
      throw new BadRequestException('Lesson not found in progress');
    }

    // Update lesson progress
    const wasCompleted = lessonProgress.completed;
    lessonProgress.completed = updateProgressDto.completed;
    lessonProgress.lastAccessedAt = new Date();
    if (updateProgressDto.completed && !wasCompleted) {
      lessonProgress.completedAt = new Date();
    }
    if (updateProgressDto.timeSpentMinutes) {
      lessonProgress.timeSpentMinutes += updateProgressDto.timeSpentMinutes;
      progress.totalTimeSpentMinutes += updateProgressDto.timeSpentMinutes;
    }

    // Recalculate section progress
    sectionProgress.completedLessons = sectionProgress.lessons.filter((l) => l.completed).length;

    // Recalculate overall progress
    const totalLessons = progress.sections.reduce((sum, s) => sum + s.totalLessons, 0);
    const completedLessons = progress.sections.reduce((sum, s) => sum + s.completedLessons, 0);
    progress.overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    progress.lastAccessedAt = new Date();

    return progress.save();
  }

  // User: Get my progress for the course
  async getMyProgress(userId: string): Promise<UserProgress> {
    console.log('getMyProgress service - userId:', userId);
    console.log('getMyProgress service - userId type:', typeof userId);
    
    const course = await this.courseModel.findOne();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const progress = await this.userProgressModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    
    console.log('getMyProgress service - progress found:', !!progress);
    console.log('getMyProgress service - query:', { userId: new Types.ObjectId(userId) });
    
    if (!progress) {
      throw new NotFoundException('You are not enrolled in this course');
    }
    return progress;
  }

  // User: Submit quiz and calculate score
  async submitQuiz(userId: string, submitQuizDto: SubmitQuizDto): Promise<any> {
    const course = await this.courseModel.findOne();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const progress = await this.userProgressModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!progress) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    // Find the section and lesson
    const section = course.sections.find(s => s._id.toString() === submitQuizDto.sectionId);
    if (!section) {
      throw new BadRequestException('Section not found');
    }

    const lesson = section.lessons.find(l => l._id.toString() === submitQuizDto.lessonId);
    if (!lesson || !lesson.quiz || lesson.quiz.length === 0) {
      throw new BadRequestException('Quiz not found for this lesson');
    }

    // Calculate score
    let correctAnswers = 0;
    const results = submitQuizDto.answers.map(answer => {
      const question = lesson.quiz[answer.questionIndex];
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

    const score = Math.round((correctAnswers / lesson.quiz.length) * 100);
    const passed = score >= 60; // Pass threshold

    // Update progress
    const sectionProgress = progress.sections.find(
      s => s.sectionId.toString() === submitQuizDto.sectionId
    );

    if (sectionProgress) {
      const lessonProgress = sectionProgress.lessons.find(
        l => l.lessonId.toString() === submitQuizDto.lessonId
      );

      if (lessonProgress) {
        lessonProgress.quizScore = score;
        lessonProgress.quizAttempts = (lessonProgress.quizAttempts || 0) + 1;
        lessonProgress.lastAccessedAt = new Date();
        await progress.save();
      }
    }

    return {
      score,
      totalQuestions: lesson.quiz.length,
      correctAnswers,
      passed,
      results,
      progress: {
        quizScore: score,
        quizAttempts: sectionProgress?.lessons.find(l => l.lessonId.toString() === submitQuizDto.lessonId)?.quizAttempts || 1,
        overallProgress: progress.overallProgress
      }
    };
  }
}
