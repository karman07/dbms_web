import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClassActivityService } from './class-activity.service';
import { CreateClassActivityDto, UpdateClassActivityDto } from './dto/class-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { multerDocsConfig } from '../config/multer-docs.config';
import { readFileSync } from 'fs';

@Controller('class-activity')
export class ClassActivityController {
  constructor(private readonly classActivityService: ClassActivityService) {}

  // ========== ADMIN ENDPOINTS ==========

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file', multerDocsConfig))
  async createActivity(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const createDto: CreateClassActivityDto = { ...body };
    if (body.duration) createDto.duration = parseInt(body.duration);
    if (file) {
      createDto.content = readFileSync(file.path, 'utf-8');
    }
    return this.classActivityService.create(createDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async getAllActivities() {
    return this.classActivityService.findAll();
  }

  @Get('admin/:activityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async getActivityById(@Param('activityId') activityId: string) {
    return this.classActivityService.findById(activityId);
  }

  @Put('admin/:activityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file', multerDocsConfig))
  async updateActivity(
    @Param('activityId') activityId: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const updateDto: UpdateClassActivityDto = { ...body };
    if (body.duration) updateDto.duration = parseInt(body.duration);
    if (file) {
      updateDto.content = readFileSync(file.path, 'utf-8');
    }
    return this.classActivityService.update(activityId, updateDto);
  }

  @Delete('admin/:activityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async deleteActivity(@Param('activityId') activityId: string) {
    await this.classActivityService.delete(activityId);
    return { message: 'Class activity deleted successfully' };
  }

  @Post('admin/:activityId/link-lesson/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async linkToLesson(@Param('activityId') activityId: string, @Param('lessonId') lessonId: string) {
    return this.classActivityService.linkToLesson(activityId, lessonId);
  }

  @Delete('admin/:activityId/unlink-lesson')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async unlinkFromLesson(@Param('activityId') activityId: string) {
    return this.classActivityService.unlinkFromLesson(activityId);
  }

  // ========== USER ENDPOINTS ==========

  @Get()
  async getAllActivitiesPublic() {
    return this.classActivityService.findAll();
  }

  @Get(':activityId')
  async getActivity(@Param('activityId') activityId: string) {
    return this.classActivityService.findById(activityId);
  }

  @Get('lesson/:lessonId')
  async getActivityByLesson(@Param('lessonId') lessonId: string) {
    return this.classActivityService.findByLessonId(lessonId);
  }
}
