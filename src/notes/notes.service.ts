import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './schemas/note.schema';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  async create(createNoteDto: CreateNoteDto, authorId: string): Promise<Note> {
    const note = new this.noteModel({
      ...createNoteDto,
      author: authorId,
    });
    return note.save();
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.noteModel.find({ author: userId })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMyNotes(userId: string): Promise<Note[]> {
    return this.noteModel.find({ author: userId })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySource(source: string, userId?: string): Promise<Note[]> {
    const query = userId 
      ? { source, $or: [{ isPublic: true }, { author: userId }] }
      : { source, isPublic: true };
    
    return this.noteModel.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId?: string): Promise<Note> {
    const note = await this.noteModel.findById(id)
      .populate('author', 'firstName lastName email')
      .exec();
    
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (!note.isPublic && note.author._id.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }
    
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(id);
    
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.author.toString() !== userId) {
      throw new ForbiddenException('You can only update your own notes');
    }

    const updatedNote = await this.noteModel.findByIdAndUpdate(
      id,
      { ...updateNoteDto, updatedAt: new Date() },
      { new: true }
    ).populate('author', 'firstName lastName email').exec();
    
    if (!updatedNote) {
      throw new NotFoundException('Note not found');
    }
    return updatedNote;
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.noteModel.findById(id);
    
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.noteModel.findByIdAndDelete(id);
  }

  async toggleBookmark(noteId: string, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
    
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.author.toString() !== userId) {
      throw new ForbiddenException('You can only bookmark your own notes');
    }

    const updatedNote = await this.noteModel.findByIdAndUpdate(
      noteId,
      { isBookmarked: !note.isBookmarked },
      { new: true }
    ).populate('author', 'firstName lastName email').exec();
    
    if (!updatedNote) {
      throw new NotFoundException('Note not found');
    }
    return updatedNote;
  }

  async toggleLike(noteId: string, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
    
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.author.toString() !== userId) {
      throw new ForbiddenException('You can only like your own notes');
    }

    const updatedNote = await this.noteModel.findByIdAndUpdate(
      noteId,
      { isLiked: !note.isLiked },
      { new: true }
    ).populate('author', 'firstName lastName email').exec();
    
    if (!updatedNote) {
      throw new NotFoundException('Note not found');
    }
    return updatedNote;
  }

  async getBookmarkedNotes(userId: string): Promise<Note[]> {
    return this.noteModel.find({ author: userId, isBookmarked: true })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getLikedNotes(userId: string): Promise<Note[]> {
    return this.noteModel.find({ author: userId, isLiked: true })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async searchNotes(query: string, userId?: string): Promise<Note[]> {
    const searchQuery = {
      $and: [
        userId ? { $or: [{ isPublic: true }, { author: userId }] } : { isPublic: true },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      ]
    };

    return this.noteModel.find(searchQuery)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}