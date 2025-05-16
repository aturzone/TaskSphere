
import { generateId } from '../utils';

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

  // Mock local storage implementation for demo
  private static getStore(): ProjectStep[] {
    const data = localStorage.getItem('project-steps');
    return data ? JSON.parse(data) : [];
  }

  private static setStore(steps: ProjectStep[]): void {
    localStorage.setItem('project-steps', JSON.stringify(steps));
  }

  static async create(stepData: ProjectStepProps): Promise<ProjectStep> {
    const step = new ProjectStep(stepData);
    const steps = this.getStore();
    steps.push(step);
    this.setStore(steps);
    return step;
  }

  static async update(id: string, stepData: Partial<ProjectStepProps>): Promise<ProjectStep | null> {
    const steps = this.getStore();
    const index = steps.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    // Create a new step instance to ensure methods are available
    const updatedStep = new ProjectStep({
      ...steps[index],
      ...stepData,
      updatedAt: new Date().toISOString()
    });
    
    steps[index] = updatedStep;
    this.setStore(steps);
    return updatedStep;
  }

  static async delete(id: string): Promise<boolean> {
    const steps = this.getStore();
    const filteredSteps = steps.filter(s => s.id !== id);
    
    if (filteredSteps.length === steps.length) {
      return false;
    }
    
    this.setStore(filteredSteps);
    return true;
  }

  static async deleteByProjectId(projectId: string): Promise<boolean> {
    const steps = this.getStore();
    const filteredSteps = steps.filter(s => s.projectId !== projectId);
    
    if (filteredSteps.length === steps.length) {
      return false;
    }
    
    this.setStore(filteredSteps);
    return true;
  }

  static async findById(id: string): Promise<ProjectStep | null> {
    const steps = this.getStore();
    const step = steps.find(s => s.id === id);
    return step ? new ProjectStep(step) : null;
  }

  static async getByProjectId(projectId: string): Promise<ProjectStep[]> {
    const steps = this.getStore();
    return steps
      .filter(step => step.projectId === projectId)
      .map(s => new ProjectStep(s));
  }

  static async getAll(): Promise<ProjectStep[]> {
    const steps = this.getStore();
    return steps.map(s => new ProjectStep(s));
  }
}
