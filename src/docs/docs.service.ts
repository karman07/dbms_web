import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocTopic } from './schemas/doc.schema';
import { CreateDocTopicDto, AddSubtopicDto } from './dto/doc.dto';

@Injectable()
export class DocsService {
  constructor(@InjectModel(DocTopic.name) private docModel: Model<DocTopic>) {}

  async createTopic(createDto: CreateDocTopicDto) {
    const subtopicsWithFilename = createDto.subtopics.map(sub => ({
      ...sub,
      filename: `${sub.name.replace(/\s+/g, '_')}.md`,
      createdAt: new Date(),
    }));

    const doc = new this.docModel({
      topic: createDto.topic,
      course: createDto.course || 'dbms',
      subtopics: subtopicsWithFilename,
    });
    return doc.save();
  }

  async getAllTopics(course = 'dbms') {
    return this.docModel.find({ course }).select('-subtopics.content').exec();
  }

  async getTopicById(id: string) {
    return this.docModel.findById(id).exec();
  }

  async deleteTopic(id: string) {
    return this.docModel.findByIdAndDelete(id).exec();
  }

  async addSubtopic(topicId: string, dto: AddSubtopicDto) {
    const doc = await this.docModel.findById(topicId);
    if (!doc) throw new NotFoundException('Topic not found');
    doc.subtopics.push({
      ...dto,
      filename: `${dto.name.replace(/\s+/g, '_')}.md`,
      createdAt: new Date(),
    });
    return doc.save();
  }

  async deleteSubtopic(topicId: string, subtopicName: string) {
    const doc = await this.docModel.findById(topicId);
    if (!doc) throw new NotFoundException('Topic not found');
    doc.subtopics = doc.subtopics.filter(s => s.name !== subtopicName);
    return doc.save();
  }

  async getSubtopic(topicId: string, subtopicName: string) {
    const doc = await this.docModel.findById(topicId);
    if (!doc) throw new NotFoundException('Topic not found');
    const sub = doc.subtopics.find(s => s.name === subtopicName);
    if (!sub) throw new NotFoundException('Subtopic not found');
    return sub;
  }

  async listSubtopics(topicId: string) {
    const doc = await this.docModel.findById(topicId);
    if (!doc) throw new NotFoundException('Topic not found');
    return doc.subtopics.map(s => ({ name: s.name, filename: s.filename }));
  }
}
