import { generateId } from '../utils';
import { ProjectStep, ProjectStepProps } from './ProjectStep';
import { apiService } from '../services/apiService';

export interface ProjectProps {
  id?: string;
  title: string;
  description?: string;
  userId: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  reminderDate?: string;
  reminderTime?: string;
  steps?: Partial<ProjectStepProps>[];
  createdAt?: string;
  updatedAt?: string;
}

export class Project {
  id: string;
  title: string;
  description: string;
  userId: string;
  color: string;
  startDate?: string;
  endDate?: string;
  reminderDate?: string;
  reminderTime?: string;
  steps: Partial<ProjectStepProps>[];
  createdAt: string;
  updatedAt: string;

  constructor(props: ProjectProps) {
    this.id = props.id || generateId();
    this.title = props.title;
    this.description = props.description || '';
    this.userId = props.userId;
    this.color = props.color || this.getRandomColor();
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.reminderDate = props.reminderDate;
    this.reminderTime = props.reminderTime;
    this.steps = props.steps || [];
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
  }

  getRandomColor(): string {
    const colors = [
      '#10B981', // Green
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#F59E0B', // Yellow
      '#EF4444', // Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Calculate progress based on project steps
  calculateProgress(): number {
    if (!this.steps || this.steps.length === 0) return 0;
    
    const totalWeight = this.steps.reduce((sum, step) => sum + (step.weightPercentage || 0), 0);
    const completedWeight = this.steps
      .filter(step => step.status === 'Done')
      .reduce((sum, step) => sum + (step.weightPercentage || 0), 0);
    
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  }

  // Server-based storage implementation
  static async create(projectData: ProjectProps): Promise<Project> {
    try {
      const result = await apiService.create('projects', projectData);
      return new Project(result);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  static async update(id: string, projectData: Partial<ProjectProps>): Promise<Project | null> {
    try {
      const result = await apiService.update('projects', id, projectData);
      return result ? new Project(result) : null;
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await apiService.delete('projects', id);
      return result.success || false;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  static async findById(id: string): Promise<Project | null> {
    try {
      const result = await apiService.getById('projects', id);
      return result ? new Project(result) : null;
    } catch (error) {
      console.error('Failed to find project by id:', error);
      return null;
    }
  }

  static async filter(filters: Partial<ProjectProps>): Promise<Project[]> {
    try {
      const projects = await apiService.getAll('projects');
      return projects.filter((project: any) => {
        for (const [key, value] of Object.entries(filters)) {
          if (project[key as keyof Project] !== value) {
            return false;
          }
        }
        return true;
      }).map((p: any) => new Project(p));
    } catch (error) {
      console.error('Failed to filter projects:', error);
      return [];
    }
  }

  static async getAll(): Promise<Project[]> {
    try {
      const projects = await apiService.getAll('projects');
      return projects.map((p: any) => new Project(p));
    } catch (error) {
      console.error('Failed to get all projects:', error);
      return [];
    }
  }

  static async list(sortOrder?: string): Promise<Project[]> {
    try {
      let projects = await apiService.getAll('projects');
      
      if (sortOrder) {
        const [field, direction] = sortOrder.split(':');
        projects.sort((a: any, b: any) => {
          if (direction === 'asc') {
            return a[field] > b[field] ? 1 : -1;
          } else {
            return a[field] < b[field] ? 1 : -1;
          }
        });
      }
      
      return projects.map((p: any) => new Project(p));
    } catch (error) {
      console.error('Failed to list projects:', error);
      return [];
    }
  }

  static async get(id: string): Promise<Project | null> {
    return this.findById(id);
  }

  // When a project step is created, updated or deleted, sync with project
  static async syncProjectSteps(projectId: string): Promise<void> {
    try {
      const steps = await ProjectStep.getByProjectId(projectId);
      await this.update(projectId, { steps: steps });
    } catch (error) {
      console.error("Failed to sync project steps:", error);
    }
  }
}
