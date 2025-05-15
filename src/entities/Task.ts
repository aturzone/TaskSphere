
import { generateId } from '../utils';

export type TaskStatus = 'Todo' | 'InProgress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskProps {
  id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  projectId?: string;
  userId: string;
  reminderDate?: string;
  reminderTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  projectId?: string;
  userId: string;
  reminderDate?: string;
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;

  constructor(props: TaskProps) {
    this.id = props.id || generateId();
    this.title = props.title;
    this.description = props.description || '';
    this.status = props.status;
    this.priority = props.priority;
    this.dueDate = props.dueDate;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.projectId = props.projectId;
    this.userId = props.userId;
    this.reminderDate = props.reminderDate;
    this.reminderTime = props.reminderTime;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
  }

  // Mock local storage implementation for demo
  private static getStore(): Task[] {
    const data = localStorage.getItem('tasks');
    return data ? JSON.parse(data) : [];
  }

  private static setStore(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  static async create(taskData: TaskProps): Promise<Task> {
    const task = new Task(taskData);
    const tasks = this.getStore();
    tasks.push(task);
    this.setStore(tasks);
    return task;
  }

  static async update(id: string, taskData: Partial<TaskProps>): Promise<Task | null> {
    const tasks = this.getStore();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    const updatedTask = {
      ...tasks[index],
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    
    tasks[index] = updatedTask;
    this.setStore(tasks);
    return new Task(updatedTask);
  }

  static async delete(id: string): Promise<boolean> {
    const tasks = this.getStore();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return false;
    }
    
    this.setStore(filteredTasks);
    return true;
  }

  static async findById(id: string): Promise<Task | null> {
    const tasks = this.getStore();
    const task = tasks.find(t => t.id === id);
    return task ? new Task(task) : null;
  }

  static async filter(filters: Partial<TaskProps>, sortOrder?: string): Promise<Task[]> {
    const tasks = this.getStore();
    let filteredTasks = tasks.filter(task => {
      for (const [key, value] of Object.entries(filters)) {
        if (task[key as keyof Task] !== value) {
          return false;
        }
      }
      return true;
    });
    
    if (sortOrder) {
      const [field, direction] = sortOrder.split(':');
      filteredTasks.sort((a, b) => {
        if (direction === 'asc') {
          return a[field as keyof Task] > b[field as keyof Task] ? 1 : -1;
        } else {
          return a[field as keyof Task] < b[field as keyof Task] ? 1 : -1;
        }
      });
    }
    
    return filteredTasks.map(t => new Task(t));
  }

  static async getAll(): Promise<Task[]> {
    const tasks = this.getStore();
    return tasks.map(t => new Task(t));
  }

  static async list(sortOrder?: string): Promise<Task[]> {
    const tasks = this.getStore();
    let sortedTasks = [...tasks];
    
    if (sortOrder) {
      const [field, direction] = sortOrder.split(':');
      sortedTasks.sort((a, b) => {
        if (direction === 'asc') {
          return a[field as keyof Task] > b[field as keyof Task] ? 1 : -1;
        } else {
          return a[field as keyof Task] < b[field as keyof Task] ? 1 : -1;
        }
      });
    }
    
    return sortedTasks.map(t => new Task(t));
  }

  static async get(id: string): Promise<Task | null> {
    return this.findById(id);
  }
}
