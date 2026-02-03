import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';
import { Course } from '../courses/schemas/course.schema';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(
    createMediaDto: CreateMediaDto,
    userId: string,
    file?: Express.Multer.File,
    thumbnail?: Express.Multer.File,
  ): Promise<Media> {
    const mediaData: any = {
      ...createMediaDto,
      uploadedBy: userId,
    };

    if (file) {
      mediaData.filePath = file.path;
      mediaData.fileSize = file.size;
      mediaData.mimeType = file.mimetype;
    }

    if (thumbnail) {
      mediaData.thumbnailPath = thumbnail.path;
    }

    const media = new this.mediaModel(mediaData);
    return media.save();
  }

  async findAll(userId?: string): Promise<Media[]> {
    const filter = userId ? { uploadedBy: userId } : {};
    return this.mediaModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Media> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async update(
    id: string,
    updateMediaDto: UpdateMediaDto,
    thumbnail?: Express.Multer.File,
  ): Promise<Media> {
    const media = await this.findById(id);

    const updateData: any = { ...updateMediaDto };

    if (thumbnail) {
      if (media.thumbnailPath && fs.existsSync(media.thumbnailPath)) {
        fs.unlinkSync(media.thumbnailPath);
      }
      updateData.thumbnailPath = thumbnail.path;
    }

    const updated = await this.mediaModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Media not found');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const media = await this.findById(id);

    if (media.filePath && fs.existsSync(media.filePath)) {
      fs.unlinkSync(media.filePath);
    }

    if (media.thumbnailPath && fs.existsSync(media.thumbnailPath)) {
      fs.unlinkSync(media.thumbnailPath);
    }

    await this.mediaModel.findByIdAndDelete(id).exec();

    // Remove media ID from lessons that contain it
    try {
      await this.courseModel.updateMany(
        { 'sections.lessons.mediaIds': new Types.ObjectId(id) },
        { $pull: { 'sections.$[].lessons.$[].mediaIds': new Types.ObjectId(id) } },
      ).exec();
    } catch (e) {
      // ignore cleanup errors
    }
  }

  async search(query: string): Promise<Media[]> {
    const filter: any = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    };

    return this.mediaModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByIds(ids: string[]): Promise<Media[]> {
    return this.mediaModel.find({ _id: { $in: ids } }).exec();
  }
}
