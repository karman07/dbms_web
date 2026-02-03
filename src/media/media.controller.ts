import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { multerMediaConfig } from '../config/multer-media.config';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      multerMediaConfig,
    ),
  )
  async create(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    @Req() req,
  ) {
    const file = files?.file?.[0];
    const thumbnail = files?.thumbnail?.[0];
    return this.mediaService.create(createMediaDto, req.user.id, file, thumbnail);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('userId') userId?: string) {
    return this.mediaService.findAll(userId);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('q') query: string) {
    return this.mediaService.search(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }], multerMediaConfig),
  )
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[] },
  ) {
    const thumbnail = files?.thumbnail?.[0];
    return this.mediaService.update(id, updateMediaDto, thumbnail);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.mediaService.delete(id);
    return { message: 'Media deleted successfully' };
  }
}
