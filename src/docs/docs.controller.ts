import { Controller, Get, Post, Delete, Param, Body, UseGuards, Patch, UseInterceptors, UploadedFiles, BadRequestException, Res, NotFoundException, Put } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DocsService } from './docs.service';
import { CreateDocTopicDto, AddSubtopicDto } from './dto/doc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { multerDocsConfig } from '../config/multer-docs.config';
import * as fs from 'fs/promises';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  // Admin: Create topic with subtopics (file upload)
  @Post('admin/topic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FilesInterceptor('files', 10, multerDocsConfig))
  async createTopic(@Body() body: { topic: string; course?: string }, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one markdown file is required');
    }

    const subtopics = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file.path, 'utf-8');
        const name = file.originalname.replace('.md', '').replace(/_/g, ' ');
        return { name, content };
      })
    );

    const dto: CreateDocTopicDto = {
      topic: body.topic,
      course: body.course || 'dbms',
      subtopics,
    };

    return this.docsService.createTopic(dto);
  }

  // Admin: Delete topic
  @Delete('admin/topic/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  deleteTopic(@Param('id') id: string) {
    return this.docsService.deleteTopic(id);
  }

  // Admin: Add subtopic (md file upload) to topic
  @Post('admin/topic/:id/subtopic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FilesInterceptor('file', 1, multerDocsConfig))
  async addSubtopic(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[], @Body() body: { name?: string }) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Markdown file is required');
    }

    const file = files[0];
    const content = await fs.readFile(file.path, 'utf-8');
    const name = body.name || file.originalname.replace('.md', '').replace(/_/g, ' ');

    const dto: AddSubtopicDto = { name, content };
    return this.docsService.addSubtopic(id, dto);
  }

  // Admin: Update subtopic
  @Put('admin/topic/:id/subtopic/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FilesInterceptor('file', 1, multerDocsConfig))
  async updateSubtopic(
    @Param('id') id: string,
    @Param('name') name: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { newName?: string },
  ) {
    let content: string | undefined;
    
    if (files && files.length > 0) {
      content = await fs.readFile(files[0].path, 'utf-8');
    }

    return this.docsService.updateSubtopic(id, name, body.newName, content);
  }

  // Admin: Delete subtopic
  @Delete('admin/topic/:id/subtopic/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  deleteSubtopic(@Param('id') id: string, @Param('name') name: string) {
    return this.docsService.deleteSubtopic(id, name);
  }

  // User: List all topics (default course dbms)
  @Get('topics')
  getAllTopics() {
    return this.docsService.getAllTopics();
  }

  // User: List subtopics for a topic
  @Get('topic/:id/subtopics')
  listSubtopics(@Param('id') id: string) {
    return this.docsService.listSubtopics(id);
  }

  // User: Get subtopic content (markdown)
  @Get('topic/:id/subtopic/:name')
  getSubtopic(@Param('id') id: string, @Param('name') name: string) {
    return this.docsService.getSubtopic(id, name);
  }

  // User: Download subtopic as markdown file
  @Get('topic/:id/subtopic/:name/download')
  async downloadSubtopic(@Param('id') id: string, @Param('name') name: string, @Res() res: Response) {
    const subtopic = await this.docsService.getSubtopic(id, name);
    
    if (!subtopic) {
      throw new NotFoundException('Subtopic not found');
    }

    const filename = `${subtopic.filename || subtopic.name.replace(/\s+/g, '_') + '.md'}`;
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(subtopic.content);
  }
}
