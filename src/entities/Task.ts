
import { generateId } from '../utils';
import { apiService } from '../services/apiService';

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

  // Server-based storage implementation
  static async create(taskData: TaskProps): Promise<Task> {
    try {
      const result = await apiService.create('tasks', taskData);
      return new Task(result);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  static async update(id: string, taskData: Partial<TaskProps>): Promise<Task | null> {
    try {
      const result = await apiService.update('tasks', id, taskData);
      return result ? new Task(result) : null;
    } catch (error) {
      console.error('Failed to update task:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await apiService.delete('tasks', id);
      return result.success || false;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  static async findById(id: string): Promise<Task | null> {
    try {
      const result = await apiService.getById('tasks', id);
      return result ? new Task(result) : null;
    } catch (error) {
      console.error('Failed to find task by id:', error);
      return null;
    }
  }

  static async filter(filters: Partial<TaskProps>, sortOrder?: string): Promise<Task[]> {
    try {
      const tasks = await apiService.getAll('tasks');
      let filteredTasks = tasks.filter((task: any) => {
        for (const [key, value] of Object.entries(filters)) {
          if (task[key as keyof Task] !== value) {
            return false;
          }
        }
        return true;
      });
      
      if (sortOrder) {
        const [field, direction] = sortOrder.split(':');
        filteredTasks.sort((a: any, b: any) => {
          if (direction === 'asc') {
            return a[field] > b[field] ? 1 : -1;
          } else {
            return a[field] < b[field] ? 1 : -1;
          }
        });
      }
      
      return filteredTasks.map((t: any) => new Task(t));
    } catch (error) {
      console.error('Failed to filter tasks:', error);
      return [];
    }
  }

  static async getAll(): Promise<Task[]> {
    try {
      const tasks = await apiService.getAll('tasks');
      return tasks.map((t: any) => new Task(t));
    } catch (error) {
      console.error('Failed to get all tasks:', error);
      return [];
    }
  }

  static async list(sortOrder?: string): Promise<Task[]> {
    try {
      let tasks = await apiService.getAll('tasks');
      
      if (sortOrder) {
        const [field, direction] = sortOrder.split(':');
        tasks.sort((a: any, b: any) => {
          if (direction === 'asc') {
            return a[field] > b[field] ? 1 : -1;
          } else {
            return a[field] < b[field] ? 1 : -1;
          }
        });
      }
      
      return tasks.map((t: any) => new Task(t));
    } catch (error) {
      console.error('Failed to list tasks:', error);
      return [];
    }
  }

  static async get(id: string): Promise<Task | null> {
    return this.findById(id);
  }
}
