
import { generateId } from '../utils';
import { apiService } from '../services/apiService';

export interface ProjectStepProps {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  weightPercentage: number;
  status?: 'NotStarted' | 'InProgress' | 'Done';
  createdAt?: string;
  updatedAt?: string;
}

export class ProjectStep {
  id: string;
  projectId: string;
  title: string;
  description: string;
  weightPercentage: number;
  status: 'NotStarted' | 'InProgress' | 'Done';
  createdAt: string;
  updatedAt: string;

  constructor(props: ProjectStepProps) {
    this.id = props.id || generateId();
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description || '';
    this.weightPercentage = props.weightPercentage;
    this.status = props.status || 'NotStarted';
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
  }

  // Server-based storage implementation
  static async create(stepData: ProjectStepProps): Promise<ProjectStep> {
    try {
      const result = await apiService.create('project-steps', stepData);
      return new ProjectStep(result);
    } catch (error) {
      console.error('Failed to create project step:', error);
      throw error;
    }
  }

  static async update(id: string, stepData: Partial<ProjectStepProps>): Promise<ProjectStep | null> {
    try {
      const result = await apiService.update('project-steps', id, stepData);
      return result ? new ProjectStep(result) : null;
    } catch (error) {
      console.error('Failed to update project step:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await apiService.delete('project-steps', id);
      return result.success || false;
    } catch (error) {
      console.error('Failed to delete project step:', error);
      return false;
    }
  }

  static async deleteByProjectId(projectId: string): Promise<boolean> {
    try {
      const steps = await this.getByProjectId(projectId);
      for (const step of steps) {
        await this.delete(step.id);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete project steps:', error);
      return false;
    }
  }

  static async findById(id: string): Promise<ProjectStep | null> {
    try {
      const result = await apiService.getById('project-steps', id);
      return result ? new ProjectStep(result) : null;
    } catch (error) {
      console.error('Failed to find project step by id:', error);
      return null;
    }
  }

  static async getByProjectId(projectId: string): Promise<ProjectStep[]> {
    try {
      const steps = await apiService.getAll('project-steps');
      return steps
        .filter((step: any) => step.projectId === projectId)
        .map((s: any) => new ProjectStep(s));
    } catch (error) {
      console.error('Failed to get project steps:', error);
      return [];
    }
  }

  static async getAll(): Promise<ProjectStep[]> {
    try {
      const steps = await apiService.getAll('project-steps');
      return steps.map((s: any) => new ProjectStep(s));
    } catch (error) {
      console.error('Failed to get all project steps:', error);
      return [];
    }
  }
}
