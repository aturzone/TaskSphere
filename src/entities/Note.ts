
import { generateId } from '../utils';

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

  // Mock local storage implementation for demo
  private static getStore(): Note[] {
    const data = localStorage.getItem('notes');
    return data ? JSON.parse(data) : [];
  }

  private static setStore(notes: Note[]): void {
    localStorage.setItem('notes', JSON.stringify(notes));
  }

  static async create(noteData: NoteProps): Promise<Note> {
    const note = new Note(noteData);
    const notes = this.getStore();
    notes.push(note);
    this.setStore(notes);
    return note;
  }

  static async update(id: string, noteData: Partial<NoteProps>): Promise<Note | null> {
    const notes = this.getStore();
    const index = notes.findIndex(n => n.id === id);
    
    if (index === -1) return null;
    
    const updatedNote = {
      ...notes[index],
      ...noteData,
      updatedAt: new Date().toISOString()
    };
    
    notes[index] = updatedNote;
    this.setStore(notes);
    return new Note(updatedNote);
  }

  static async delete(id: string): Promise<boolean> {
    const notes = this.getStore();
    const filteredNotes = notes.filter(n => n.id !== id);
    
    if (filteredNotes.length === notes.length) {
      return false;
    }
    
    this.setStore(filteredNotes);
    return true;
  }

  static async findById(id: string): Promise<Note | null> {
    const notes = this.getStore();
    const note = notes.find(n => n.id === id);
    return note ? new Note(note) : null;
  }

  static async filter(filters: Partial<NoteProps>): Promise<Note[]> {
    const notes = this.getStore();
    return notes.filter(note => {
      for (const [key, value] of Object.entries(filters)) {
        if (note[key as keyof Note] !== value) {
          return false;
        }
      }
      return true;
    }).map(n => new Note(n));
  }

  static async getAll(): Promise<Note[]> {
    const notes = this.getStore();
    return notes.map(n => new Note(n));
  }

  static async list(sortOrder?: string): Promise<Note[]> {
    const notes = this.getStore();
    let sortedNotes = [...notes];
    
    if (sortOrder) {
      const [field, direction] = sortOrder.split(':');
      sortedNotes.sort((a, b) => {
        if (direction === 'asc') {
          return a[field as keyof Note] > b[field as keyof Note] ? 1 : -1;
        } else {
          return a[field as keyof Note] < b[field as keyof Note] ? 1 : -1;
        }
      });
    }
    
    return sortedNotes.map(n => new Note(n));
  }

  static async get(id: string): Promise<Note | null> {
    return this.findById(id);
  }
}
