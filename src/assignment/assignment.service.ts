import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment } from './schemas/assignment.schema';
import { Course } from '../courses/schemas/course.schema';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignmentData: any = {
      title: createAssignmentDto.title,
      description: createAssignmentDto.description,
      content: createAssignmentDto.content,
      dueDate: createAssignmentDto.dueDate,
      maxScore: createAssignmentDto.maxScore,
    };
    
    if (createAssignmentDto.lessonId) {
      assignmentData.lessonId = new Types.ObjectId(createAssignmentDto.lessonId);
    }
    
    const assignment = new this.assignmentModel(assignmentData);
    return assignment.save();
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentModel.find().exec();
  }

  async findById(assignmentId: string): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(assignmentId).exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  async findByLessonId(lessonId: string): Promise<Assignment[]> {
    return this.assignmentModel.find({ lessonId: new Types.ObjectId(lessonId) }).exec();
  }

  async update(assignmentId: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findById(assignmentId);
    Object.assign(assignment, updateAssignmentDto);
    return assignment.save();
  }

  async delete(assignmentId: string): Promise<void> {
    const result = await this.assignmentModel.findByIdAndDelete(assignmentId).exec();
    if (!result) {
      throw new NotFoundException('Assignment not found');
    }
  }

  async linkToLesson(assignmentId: string, lessonId: string): Promise<Assignment> {
    const assignment = await this.findById(assignmentId);
    assignment.lessonId = new Types.ObjectId(lessonId);
    const saved = await assignment.save();

    // Also set linkedAssignmentId on the lesson in Course using atomic update
    try {
      await this.courseModel.updateOne(
        {},
        { $addToSet: { 'sections.$[].lessons.$[l].linkedAssignmentIds': saved._id } },
        { arrayFilters: [{ 'l._id': new Types.ObjectId(lessonId) }] },
      ).exec();
    } catch (e) {
      // ignore update errors
    }

    return saved;
  }

  async unlinkFromLesson(assignmentId: string): Promise<Assignment> {
    const assignment = await this.findById(assignmentId);
    assignment.lessonId = undefined;
    const saved = await assignment.save();

    // Remove linkedAssignmentId from course lesson if present using atomic update
    try {
      await this.courseModel.updateOne(
        {},
        { $pull: { 'sections.$[].lessons.$[l].linkedAssignmentIds': new Types.ObjectId(assignmentId) } },
        { arrayFilters: [{ 'l._id': { $exists: true } }] },
      ).exec();
    } catch (e) {
      // ignore errors
    }

    return saved;
  }
}
