import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from './schemas/course.schema';
import { UserProgress } from './schemas/user-progress.schema';
import { CreateCourseDto, UpdateCourseDto, CreateSectionDto, UpdateSectionDto, CreateLessonDto, UpdateLessonDto } from './dto/course.dto';
import { UpdateProgressDto, SubmitQuizDto } from './dto/progress.dto';
import { Quiz } from '../quiz/schemas/quiz.schema';
import { Assignment } from '../assignment/schemas/assignment.schema';
import { ClassActivity } from '../class-activity/schemas/class-activity.schema';
import { DocTopic } from '../docs/schemas/doc.schema';
import { Media } from '../media/schemas/media.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(UserProgress.name) private userProgressModel: Model<UserProgress>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(ClassActivity.name) private classActivityModel: Model<ClassActivity>,
    @InjectModel(DocTopic.name) private docTopicModel: Model<DocTopic>,
    @InjectModel(Media.name) private mediaModel: Model<Media>,
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
    const courseObj = await this.courseModel.findOne({ isPublished: true }).lean().exec();
    if (!courseObj) {
      throw new NotFoundException('Course not found or not published');
    }
    await this.populateLinkedResources(courseObj as any);
    return courseObj as any;
  }

  // Admin: Get course (including unpublished)
  async getCourseAdmin(): Promise<Course> {
    const courseObj = await this.getCourseSingle();
    // convert to plain object to attach runtime fields safely
    const plain = (courseObj as any).toObject ? (courseObj as any).toObject() : courseObj;
    await this.populateLinkedResources(plain as any);
    return plain as any;
  }

  // Attach linked quizzes, assignments, activities to each lesson before returning
  private async populateLinkedResources(course: any) {
    // course may be a plain object (from .lean()) or a mongoose doc converted to object
    if (!course || !Array.isArray(course.sections)) return;

    for (const section of course.sections) {
      if (!section || !Array.isArray(section.lessons)) continue;
      for (const lesson of section.lessons) {
        try {
          const lessonId = lesson._id;
          if (!lessonId) continue;

          // Helper function to parse IDs (handle both ObjectId and stringified JSON arrays)
          const parseIds = (ids: any[]): any[] => {
            if (!ids || !Array.isArray(ids)) return [];
            return ids.flatMap(id => {
              if (typeof id === 'string') {
                try {
                  // Try to parse if it's a JSON stringified array
                  const parsed = JSON.parse(id);
                  return Array.isArray(parsed) ? parsed : [id];
                } catch {
                  return [id];
                }
              }
              return [id];
            });
          };

          // Fetch quizzes linked to this lesson by lessonId OR by linkedQuizIds array
          let quizIds = parseIds(lesson.linkedQuizIds || []);
          const [quizzesByLesson, quizzesByIds, assignments, activities] = await Promise.all([
            this.quizModel.find({ lessonId: lessonId }).lean().exec(),
            quizIds.length > 0 ? this.quizModel.find({ _id: { $in: quizIds } }).lean().exec() : Promise.resolve([]),
            lesson.linkedAssignmentIds && Array.isArray(lesson.linkedAssignmentIds) && parseIds(lesson.linkedAssignmentIds).length > 0
              ? this.assignmentModel.find({ $or: [{ lessonId: lessonId }, { _id: { $in: parseIds(lesson.linkedAssignmentIds) } }] }).lean().exec()
              : this.assignmentModel.find({ lessonId: lessonId }).lean().exec(),
            lesson.linkedActivityIds && Array.isArray(lesson.linkedActivityIds) && parseIds(lesson.linkedActivityIds).length > 0
              ? this.classActivityModel.find({ $or: [{ lessonId: lessonId }, { _id: { $in: parseIds(lesson.linkedActivityIds) } }] }).lean().exec()
              : this.classActivityModel.find({ lessonId: lessonId }).lean().exec(),
          ]);

          // Combine quizzes from both sources and remove duplicates
          const allQuizzes = [...quizzesByLesson, ...quizzesByIds];
          const uniqueQuizzes = Array.from(new Map(allQuizzes.map(q => [q._id.toString(), q])).values());

          // Fetch media if mediaIds array is present
          let mediaList: any[] = [];
          const mediaIds = parseIds(lesson.mediaIds || []);
          if (mediaIds.length > 0) {
            try {
              mediaList = await this.mediaModel.find({ _id: { $in: mediaIds } }).lean().exec();
            } catch (e) {
              mediaList = [];
            }
          }

          // Fetch subtopics if docSubtopicIds array is present
          let docSubtopics: any[] = [];
          const docSubtopicIds = parseIds(lesson.docSubtopicIds || []);
          if (docSubtopicIds.length > 0) {
            try {
              const topics: any[] = await this.docTopicModel.find().lean().exec();
              for (const topic of topics) {
                if (topic.subtopics && Array.isArray(topic.subtopics)) {
                  const matchingSubtopics = topic.subtopics.filter((s: any) => 
                    docSubtopicIds.some((id: any) => s._id && s._id.toString() === id.toString())
                  );
                  matchingSubtopics.forEach((s: any) => {
                    s.topicId = topic._id;
                    s.topic = topic.topic;
                  });
                  docSubtopics.push(...matchingSubtopics);
                }
              }
            } catch (e) {
              docSubtopics = [];
            }
          }

          // Replace ID arrays with actual populated data
          lesson.linkedQuizzes = uniqueQuizzes;
          lesson.linkedAssignments = assignments;
          lesson.linkedActivities = activities;
          lesson.media = mediaList;
          lesson.docSubtopics = docSubtopics;

          // Remove the ID-only fields to avoid confusion
          delete lesson.linkedQuizIds;
          delete lesson.linkedAssignmentIds;
          delete lesson.linkedActivityIds;
          delete lesson.mediaIds;
          delete lesson.docSubtopicIds;
        } catch (e) {
          // ignore per-lesson errors but continue
        }
      }
    }
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

  async getLessonById(lessonId: string): Promise<any> {
    const course = await this.getCourseSingle();
    
    for (const section of course.sections) {
      const lesson = section.lessons.find(l => l._id.toString() === lessonId);
      if (lesson) {
        return {
          _id: lesson._id,
          title: lesson.title,
          sectionTitle: section.title,
          order: lesson.order,
          estimatedMinutes: lesson.estimatedMinutes,
          isPublished: lesson.isPublished
        };
      }
    }
    
    throw new NotFoundException('Lesson not found');
  }
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
    if (!lesson) {
      throw new BadRequestException('Lesson not found');
    }

    // Fetch quiz by lessonId
    const quiz = await this.quizModel.findOne({ lessonId: lesson._id }).lean().exec();
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      throw new BadRequestException('Quiz not found for this lesson');
    }

    // Calculate score
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
      passed,
      results,
      totalQuestions: quiz.questions.length,
    };
  }
}
