
import { generateId } from '../utils';
import { apiService } from '../services/apiService';

export interface NoteProps {
  id?: string;
  title: string;
  content?: string;
  userId: string;
  projectId?: string;
  noteDate?: string;
  reminderDate?: string;
  reminderTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  projectId?: string;
  noteDate: string;
  reminderDate?: string;
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;

  constructor(props: NoteProps) {
    this.id = props.id || generateId();
    this.title = props.title;
    this.content = props.content || '';
    this.userId = props.userId;
    this.projectId = props.projectId;
    this.noteDate = props.noteDate || new Date().toISOString();
    this.reminderDate = props.reminderDate;
    this.reminderTime = props.reminderTime;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
  }

  // Server-based storage implementation
  static async create(noteData: NoteProps): Promise<Note> {
    try {
      const result = await apiService.create('notes', noteData);
      return new Note(result);
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  }

  static async update(id: string, noteData: Partial<NoteProps>): Promise<Note | null> {
    try {
      const result = await apiService.update('notes', id, noteData);
      return result ? new Note(result) : null;
    } catch (error) {
      console.error('Failed to update note:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await apiService.delete('notes', id);
      return result.success || false;
    } catch (error) {
      console.error('Failed to delete note:', error);
      return false;
    }
  }

  static async findById(id: string): Promise<Note | null> {
    try {
      const result = await apiService.getById('notes', id);
      return result ? new Note(result) : null;
    } catch (error) {
      console.error('Failed to find note by id:', error);
      return null;
    }
  }

  static async filter(filters: Partial<NoteProps>): Promise<Note[]> {
    try {
      const notes = await apiService.getAll('notes');
      return notes.filter((note: any) => {
        for (const [key, value] of Object.entries(filters)) {
          if (note[key as keyof Note] !== value) {
            return false;
          }
        }
        return true;
      }).map((n: any) => new Note(n));
    } catch (error) {
      console.error('Failed to filter notes:', error);
      return [];
    }
  }

  static async getAll(): Promise<Note[]> {
    try {
      const notes = await apiService.getAll('notes');
      return notes.map((n: any) => new Note(n));
    } catch (error) {
      console.error('Failed to get all notes:', error);
      return [];
    }
  }

  static async list(sortOrder?: string): Promise<Note[]> {
    try {
      let notes = await apiService.getAll('notes');
      
      if (sortOrder) {
        const [field, direction] = sortOrder.split(':');
        notes.sort((a: any, b: any) => {
          if (direction === 'asc') {
            return a[field] > b[field] ? 1 : -1;
          } else {
            return a[field] < b[field] ? 1 : -1;
          }
        });
      }
      
      return notes.map((n: any) => new Note(n));
    } catch (error) {
      console.error('Failed to list notes:', error);
      return [];
    }
  }

  static async get(id: string): Promise<Note | null> {
    return this.findById(id);
  }
}
