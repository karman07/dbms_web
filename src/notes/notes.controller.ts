import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createNoteDto: CreateNoteDto, @Request() req) {
    return this.notesService.create(createNoteDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.headers.authorization ? req.user?.id : undefined;
    return this.notesService.findAll(userId);
  }

  @Get('my-notes')
  @UseGuards(JwtAuthGuard)
  findMyNotes(@Request() req) {
    return this.notesService.findMyNotes(req.user.id);
  }

  @Get('bookmarked')
  @UseGuards(JwtAuthGuard)
  getBookmarkedNotes(@Request() req) {
    return this.notesService.getBookmarkedNotes(req.user.id);
  }

  @Get('liked')
  @UseGuards(JwtAuthGuard)
  getLikedNotes(@Request() req) {
    return this.notesService.getLikedNotes(req.user.id);
  }

  @Get('search')
  searchNotes(@Query('q') query: string, @Request() req) {
    const userId = req.headers.authorization ? req.user?.id : undefined;
    return this.notesService.searchNotes(query, userId);
  }

  @Get('source/:source')
  findBySource(@Param('source') source: string, @Request() req) {
    const userId = req.headers.authorization ? req.user?.id : undefined;
    return this.notesService.findBySource(source, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.headers.authorization ? req.user?.id : undefined;
    return this.notesService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @Request() req) {
    return this.notesService.update(id, updateNoteDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.notesService.remove(id, req.user.id);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  toggleBookmark(@Param('id') id: string, @Request() req) {
    return this.notesService.toggleBookmark(id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('id') id: string, @Request() req) {
    return this.notesService.toggleLike(id, req.user.id);
  }
}