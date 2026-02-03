import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassActivity } from './schemas/class-activity.schema';
import { Course } from '../courses/schemas/course.schema';
import { CreateClassActivityDto, UpdateClassActivityDto } from './dto/class-activity.dto';

@Injectable()
export class ClassActivityService {
  constructor(
    @InjectModel(ClassActivity.name) private classActivityModel: Model<ClassActivity>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(createClassActivityDto: CreateClassActivityDto): Promise<ClassActivity> {
    const activityData: any = {
      title: createClassActivityDto.title,
      description: createClassActivityDto.description,
      content: createClassActivityDto.content,
      duration: createClassActivityDto.duration,
    };
    
    if (createClassActivityDto.lessonId) {
      activityData.lessonId = new Types.ObjectId(createClassActivityDto.lessonId);
    }
    
    const activity = new this.classActivityModel(activityData);
    return activity.save();
  }

  async findAll(): Promise<ClassActivity[]> {
    return this.classActivityModel.find().exec();
  }

  async findById(activityId: string): Promise<ClassActivity> {
    const activity = await this.classActivityModel.findById(activityId).exec();
    if (!activity) {
      throw new NotFoundException('Class activity not found');
    }
    return activity;
  }

  async findByLessonId(lessonId: string): Promise<ClassActivity[]> {
    return this.classActivityModel.find({ lessonId: new Types.ObjectId(lessonId) }).exec();
  }

  async update(activityId: string, updateClassActivityDto: UpdateClassActivityDto): Promise<ClassActivity> {
    const activity = await this.findById(activityId);
    Object.assign(activity, updateClassActivityDto);
    return activity.save();
  }

  async delete(activityId: string): Promise<void> {
    const result = await this.classActivityModel.findByIdAndDelete(activityId).exec();
    if (!result) {
      throw new NotFoundException('Class activity not found');
    }

    // Remove activity ID from lessons that contain it
    try {
      await this.courseModel.updateMany(
        { 'sections.lessons.linkedActivityIds': new Types.ObjectId(activityId) },
        { $pull: { 'sections.$[].lessons.$[].linkedActivityIds': new Types.ObjectId(activityId) } },
      ).exec();
    } catch (e) {
      // ignore cleanup errors
    }
  }

  async linkToLesson(activityId: string, lessonId: string): Promise<ClassActivity> {
    const activity = await this.findById(activityId);
    activity.lessonId = new Types.ObjectId(lessonId);
    const saved = await activity.save();

    // Also set linkedActivityId on the corresponding lesson in Course using atomic update
    try {
      await this.courseModel.updateOne(
        {},
        { $addToSet: { 'sections.$[].lessons.$[l].linkedActivityIds': saved._id } },
        { arrayFilters: [{ 'l._id': new Types.ObjectId(lessonId) }] },
      ).exec();
    } catch (e) {
      // ignore errors
    }

    return saved;
  }

  async unlinkFromLesson(activityId: string): Promise<ClassActivity> {
    const activity = await this.findById(activityId);
    activity.lessonId = undefined;
    const saved = await activity.save();

    // Remove linkedActivityId from course lesson if present using atomic update
    try {
      await this.courseModel.updateOne(
        {},
        { $pull: { 'sections.$[].lessons.$[l].linkedActivityIds': new Types.ObjectId(activityId) } },
        { arrayFilters: [{ 'l._id': { $exists: true } }] },
      ).exec();
    } catch (e) {
      // ignore errors
    }

    return saved;
  }
}
