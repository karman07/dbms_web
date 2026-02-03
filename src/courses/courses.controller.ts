import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerCourseConfig } from '../config/multer-course.config';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateLessonDto,
  UpdateLessonDto,
} from './dto/course.dto';
import { UpdateProgressDto, SubmitQuizDto } from './dto/progress.dto';
import { readFileSync } from 'fs';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ========== ADMIN ENDPOINTS ==========

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async createCourse(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.coursesService.createCourse(createCourseDto, req.user.id);
  }

  @Put('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async updateCourse(@Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.updateCourse(updateCourseDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async getCourseAdmin() {
    return this.coursesService.getCourseAdmin();
  }

  // Section Management
  @Post('admin/section')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async addSection(@Body() createSectionDto: CreateSectionDto) {
    return this.coursesService.addSection(createSectionDto);
  }

  @Put('admin/section/:sectionIndex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async updateSection(
    @Param('sectionIndex') sectionIndex: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.coursesService.updateSection(parseInt(sectionIndex), updateSectionDto);
  }

  @Delete('admin/section/:sectionIndex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async deleteSection(@Param('sectionIndex') sectionIndex: string) {
    return this.coursesService.deleteSection(parseInt(sectionIndex));
  }

  // Lesson Management
  @Post('admin/section/:sectionIndex/lesson')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'content', maxCount: 1 },
        { name: 'video', maxCount: 1 },
        { name: 'resources', maxCount: 10 },
      ],
      multerCourseConfig,
    ),
  )
  async addLesson(
    @Param('sectionIndex') sectionIndex: string,
    @Body() body: any,
    @UploadedFiles() files: { content?: Express.Multer.File[], video?: Express.Multer.File[], resources?: Express.Multer.File[] },
  ) {
    // Parse and transform multipart/form-data fields
    const createLessonDto: any = { ...body };
    
    // Helper to parse JSON string or array
    const parseArrayField = (field: any): any[] => {
      if (!field) return [];
      if (Array.isArray(field)) {
        // If array contains stringified JSON, parse it
        return field.flatMap(item => {
          if (typeof item === 'string') {
            try {
              const parsed = JSON.parse(item);
              return Array.isArray(parsed) ? parsed : [item];
            } catch {
              return [item];
            }
          }
          return [item];
        });
      }
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [field];
        } catch {
          return [field];
        }
      }
      return [];
    };
    
    if (createLessonDto.quiz && typeof createLessonDto.quiz === 'string') {
      try {
        createLessonDto.quiz = JSON.parse(createLessonDto.quiz);
      } catch (e) {
        delete createLessonDto.quiz;
      }
    }
    if (createLessonDto.order !== undefined) {
      createLessonDto.order = parseInt(createLessonDto.order);
    }
    if (createLessonDto.estimatedMinutes !== undefined) {
      createLessonDto.estimatedMinutes = parseInt(createLessonDto.estimatedMinutes);
    }
    if (createLessonDto.isPublished !== undefined) {
      createLessonDto.isPublished = createLessonDto.isPublished === 'true' || createLessonDto.isPublished === true;
    }
    
    // Parse array fields
    if (createLessonDto.mediaIds) {
      createLessonDto.mediaIds = parseArrayField(createLessonDto.mediaIds);
    }
    if (createLessonDto.resources && !files?.resources) {
      createLessonDto.resources = parseArrayField(createLessonDto.resources);
    }
    if (createLessonDto.docSubtopicIds) {
      createLessonDto.docSubtopicIds = parseArrayField(createLessonDto.docSubtopicIds);
    }
    if (createLessonDto.linkedQuizIds) {
      createLessonDto.linkedQuizIds = parseArrayField(createLessonDto.linkedQuizIds);
    }
    if (createLessonDto.linkedAssignmentIds) {
      createLessonDto.linkedAssignmentIds = parseArrayField(createLessonDto.linkedAssignmentIds);
    }
    if (createLessonDto.linkedActivityIds) {
      createLessonDto.linkedActivityIds = parseArrayField(createLessonDto.linkedActivityIds);
    }
    
    // If markdown file is uploaded, read its content
    if (files?.content && files.content[0]) {
      createLessonDto.content = readFileSync(files.content[0].path, 'utf-8');
    }
    // If video file is uploaded, use it; otherwise keep the URL from body
    if (files?.video && files.video[0]) {
      createLessonDto.videoUrl = `/uploads/courses/videos/${files.video[0].filename}`;
    }
    // If resource files are uploaded, use them; otherwise keep the URLs from body
    if (files?.resources && files.resources.length > 0) {
      createLessonDto.resources = files.resources.map(
        (file) => `/uploads/courses/resources/${file.filename}`,
      );
    }
    return this.coursesService.addLesson(parseInt(sectionIndex), createLessonDto);
  }

  @Put('admin/section/:sectionIndex/lesson/:lessonIndex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'content', maxCount: 1 },
        { name: 'video', maxCount: 1 },
        { name: 'resources', maxCount: 10 },
      ],
      multerCourseConfig,
    ),
  )
  async updateLesson(
    @Param('sectionIndex') sectionIndex: string,
    @Param('lessonIndex') lessonIndex: string,
    @Body() body: any,
    @UploadedFiles() files: { content?: Express.Multer.File[], video?: Express.Multer.File[], resources?: Express.Multer.File[] },
  ) {
    // Parse and transform multipart/form-data fields
    const updateLessonDto: any = { ...body };
    
    // Helper to parse JSON string or array
    const parseArrayField = (field: any): any[] => {
      if (!field) return [];
      if (Array.isArray(field)) {
        // If array contains stringified JSON, parse it
        return field.flatMap(item => {
          if (typeof item === 'string') {
            try {
              const parsed = JSON.parse(item);
              return Array.isArray(parsed) ? parsed : [item];
            } catch {
              return [item];
            }
          }
          return [item];
        });
      }
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [field];
        } catch {
          return [field];
        }
      }
      return [];
    };
    
    if (updateLessonDto.quiz && typeof updateLessonDto.quiz === 'string') {
      try {
        updateLessonDto.quiz = JSON.parse(updateLessonDto.quiz);
      } catch (e) {
        delete updateLessonDto.quiz;
      }
    }
    if (updateLessonDto.order !== undefined) {
      updateLessonDto.order = parseInt(updateLessonDto.order);
    }
    if (updateLessonDto.estimatedMinutes !== undefined) {
      updateLessonDto.estimatedMinutes = parseInt(updateLessonDto.estimatedMinutes);
    }
    if (updateLessonDto.isPublished !== undefined) {
      updateLessonDto.isPublished = updateLessonDto.isPublished === 'true' || updateLessonDto.isPublished === true;
    }
    
    // Parse array fields
    if (updateLessonDto.mediaIds) {
      updateLessonDto.mediaIds = parseArrayField(updateLessonDto.mediaIds);
    }
    if (updateLessonDto.resources && !files?.resources) {
      updateLessonDto.resources = parseArrayField(updateLessonDto.resources);
    }
    if (updateLessonDto.docSubtopicIds) {
      updateLessonDto.docSubtopicIds = parseArrayField(updateLessonDto.docSubtopicIds);
    }
    if (updateLessonDto.linkedQuizIds) {
      updateLessonDto.linkedQuizIds = parseArrayField(updateLessonDto.linkedQuizIds);
    }
    if (updateLessonDto.linkedAssignmentIds) {
      updateLessonDto.linkedAssignmentIds = parseArrayField(updateLessonDto.linkedAssignmentIds);
    }
    if (updateLessonDto.linkedActivityIds) {
      updateLessonDto.linkedActivityIds = parseArrayField(updateLessonDto.linkedActivityIds);
    }
    
    // If markdown file is uploaded, read its content
    if (files?.content && files.content[0]) {
      updateLessonDto.content = readFileSync(files.content[0].path, 'utf-8');
    }
    // If video file is uploaded, use it; otherwise keep the URL from body
    if (files?.video && files.video[0]) {
      updateLessonDto.videoUrl = `/uploads/courses/videos/${files.video[0].filename}`;
    }
    // If resource files are uploaded, use them; otherwise keep the URLs from body
    if (files?.resources && files.resources.length > 0) {
      updateLessonDto.resources = files.resources.map(
        (file) => `/uploads/courses/resources/${file.filename}`,
      );
    }
    return this.coursesService.updateLesson(
      parseInt(sectionIndex),
      parseInt(lessonIndex),
      updateLessonDto,
    );
  }

  @Delete('admin/section/:sectionIndex/lesson/:lessonIndex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async deleteLesson(
    @Param('sectionIndex') sectionIndex: string,
    @Param('lessonIndex') lessonIndex: string,
  ) {
    return this.coursesService.deleteLesson(
      parseInt(sectionIndex),
      parseInt(lessonIndex),
    );
  }

  // ========== PUBLIC/USER ENDPOINTS ==========

  @Get()
  async getCourse() {
    return this.coursesService.getPublishedCourse();
  }

  @Post('enroll')
  @UseGuards(JwtAuthGuard)
  async enrollInCourse(@Request() req) {
    return this.coursesService.enrollInCourse(req.user.id);
  }

  @Put('progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req,
  ) {
    return this.coursesService.updateProgress(req.user.id, updateProgressDto);
  }

  @Get('my-progress')
  @UseGuards(JwtAuthGuard)
  async getMyProgress(@Request() req) {
    console.log('getMyProgress - req.user:', req.user);
    console.log('getMyProgress - req.user.id:', req.user.id);
    console.log('getMyProgress - req.user.uid:', req.user.uid);
    return this.coursesService.getMyProgress(req.user.id);
  }

  @Get('lesson/:lessonId')
  async getLessonById(@Param('lessonId') lessonId: string) {
    return this.coursesService.getLessonById(lessonId);
  }

  @Post('quiz/submit')
  @UseGuards(JwtAuthGuard)
  async submitQuiz(
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req,
  ) {
    return this.coursesService.submitQuiz(req.user.id, submitQuizDto);
  }
}
