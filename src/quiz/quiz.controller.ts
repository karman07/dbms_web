import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // ========== ADMIN ENDPOINTS ==========

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async getAllQuizzes() {
    return this.quizService.findAll();
  }

  @Get('admin/:quizId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async getQuizById(@Param('quizId') quizId: string) {
    return this.quizService.findById(quizId);
  }

  @Put('admin/:quizId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async updateQuiz(@Param('quizId') quizId: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(quizId, updateQuizDto);
  }

  @Delete('admin/:quizId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async deleteQuiz(@Param('quizId') quizId: string) {
    await this.quizService.delete(quizId);
    return { message: 'Quiz deleted successfully' };
  }

  @Post('admin/:quizId/link-lesson/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async linkToLesson(@Param('quizId') quizId: string, @Param('lessonId') lessonId: string) {
    return this.quizService.linkToLesson(quizId, lessonId);
  }

  @Delete('admin/:quizId/unlink-lesson')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async unlinkFromLesson(@Param('quizId') quizId: string) {
    return this.quizService.unlinkFromLesson(quizId);
  }

  // ========== USER ENDPOINTS ==========

  @Get()
  async getAllQuizzesPublic() {
    return this.quizService.findAll();
  }

  @Get(':quizId')
  async getQuiz(@Param('quizId') quizId: string) {
    return this.quizService.findById(quizId);
  }

  @Get('lesson/:lessonId')
  async getQuizByLesson(@Param('lessonId') lessonId: string) {
    return this.quizService.findByLessonId(lessonId);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitQuiz(@Body() submitQuizDto: SubmitQuizDto, @Request() req) {
    return this.quizService.submitQuiz(req.user.id, submitQuizDto);
  }
}
