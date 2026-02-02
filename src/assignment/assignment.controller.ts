import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { multerDocsConfig } from '../config/multer-docs.config';
import { readFileSync } from 'fs';

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  // ========== ADMIN ENDPOINTS ==========

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file', multerDocsConfig))
  async createAssignment(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const createDto: CreateAssignmentDto = { ...body };
    if (file) {
      createDto.content = readFileSync(file.path, 'utf-8');
    }
    return this.assignmentService.create(createDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async getAllAssignments() {
    return this.assignmentService.findAll();
  }

  @Get('admin/:assignmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async getAssignmentById(@Param('assignmentId') assignmentId: string) {
    return this.assignmentService.findById(assignmentId);
  }

  @Put('admin/:assignmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file', multerDocsConfig))
  async updateAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const updateDto: UpdateAssignmentDto = { ...body };
    if (file) {
      updateDto.content = readFileSync(file.path, 'utf-8');
    }
    return this.assignmentService.update(assignmentId, updateDto);
  }

  @Delete('admin/:assignmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async deleteAssignment(@Param('assignmentId') assignmentId: string) {
    await this.assignmentService.delete(assignmentId);
    return { message: 'Assignment deleted successfully' };
  }

  @Post('admin/:assignmentId/link-lesson/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async linkToLesson(@Param('assignmentId') assignmentId: string, @Param('lessonId') lessonId: string) {
    return this.assignmentService.linkToLesson(assignmentId, lessonId);
  }

  @Delete('admin/:assignmentId/unlink-lesson')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async unlinkFromLesson(@Param('assignmentId') assignmentId: string) {
    return this.assignmentService.unlinkFromLesson(assignmentId);
  }

  // ========== USER ENDPOINTS ==========

  @Get()
  async getAllAssignmentsPublic() {
    return this.assignmentService.findAll();
  }

  @Get(':assignmentId')
  async getAssignment(@Param('assignmentId') assignmentId: string) {
    return this.assignmentService.findById(assignmentId);
  }

  @Get('lesson/:lessonId')
  async getAssignmentByLesson(@Param('lessonId') lessonId: string) {
    return this.assignmentService.findByLessonId(lessonId);
  }
}
