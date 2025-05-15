
import { generateId } from '../utils';

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

  // Mock local storage implementation for demo
  private static getStore(): Project[] {
    const data = localStorage.getItem('projects');
    return data ? JSON.parse(data) : [];
  }

  private static setStore(projects: Project[]): void {
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  static async create(projectData: ProjectProps): Promise<Project> {
    const project = new Project(projectData);
    const projects = this.getStore();
    projects.push(project);
    this.setStore(projects);
    return project;
  }

  static async update(id: string, projectData: Partial<ProjectProps>): Promise<Project | null> {
    const projects = this.getStore();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    // Create a new project instance to ensure the getRandomColor method is available
    const updatedProject = new Project({
      ...projects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    });
    
    projects[index] = updatedProject;
    this.setStore(projects);
    return updatedProject;
  }

  static async delete(id: string): Promise<boolean> {
    const projects = this.getStore();
    const filteredProjects = projects.filter(p => p.id !== id);
    
    if (filteredProjects.length === projects.length) {
      return false;
    }
    
    this.setStore(filteredProjects);
    return true;
  }

  static async findById(id: string): Promise<Project | null> {
    const projects = this.getStore();
    const project = projects.find(p => p.id === id);
    return project ? new Project(project) : null;
  }

  static async filter(filters: Partial<ProjectProps>): Promise<Project[]> {
    const projects = this.getStore();
    return projects.filter(project => {
      for (const [key, value] of Object.entries(filters)) {
        if (project[key as keyof Project] !== value) {
          return false;
        }
      }
      return true;
    }).map(p => new Project(p));
  }

  static async getAll(): Promise<Project[]> {
    const projects = this.getStore();
    return projects.map(p => new Project(p));
  }

  static async list(sortOrder?: string): Promise<Project[]> {
    const projects = this.getStore();
    let sortedProjects = [...projects];
    
    if (sortOrder) {
      const [field, direction] = sortOrder.split(':');
      sortedProjects.sort((a, b) => {
        if (direction === 'asc') {
          return a[field as keyof Project] > b[field as keyof Project] ? 1 : -1;
        } else {
          return a[field as keyof Project] < b[field as keyof Project] ? 1 : -1;
        }
      });
    }
    
    return sortedProjects.map(p => new Project(p));
  }

  static async get(id: string): Promise<Project | null> {
    return this.findById(id);
  }
}
