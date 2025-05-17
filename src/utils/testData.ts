
import { Project } from '@/entities/Project';
import { ProjectStep } from '@/entities/ProjectStep';
import { Task, TaskStatus, TaskPriority } from '@/entities/Task';
import { Note } from '@/entities/Note';

export const createTestData = async () => {
  // Create introductory project
  const projects = [
    {
      title: "Getting Started with TaskSphere",
      description: "Welcome to TaskSphere! This project will help you learn the basics of the application.",
      color: "#10B981", // Green
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      userId: "local-user"
    }
  ];

  const projectData = [];
  
  // Create project and store the result
  for (const project of projects) {
    const newProject = await Project.create(project);
    projectData.push(newProject);
  }

  // Create steps for the project
  const projectSteps = [
    {
      projectId: projectData[0].id,
      title: "Explore the Interface",
      description: "Get familiar with the TaskSphere dashboard and navigation",
      weightPercentage: 20,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[0].id,
      title: "Create Your First Task",
      description: "Add a new task using the 'Add Task' button",
      weightPercentage: 20,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[0].id,
      title: "Organize with Projects",
      description: "Learn how to create and manage projects",
      weightPercentage: 20,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[0].id,
      title: "Take Notes",
      description: "Try the note-taking features",
      weightPercentage: 20,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[0].id,
      title: "Visualize in Knowledge Galaxy",
      description: "Explore the relationships between your items",
      weightPercentage: 20,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    }
  ];
  
  // Create all project steps
  for (const step of projectSteps) {
    await ProjectStep.create(step);
  }

  // Create introductory tasks
  const tasks = [
    {
      title: "Create your first project",
      description: "Click on 'Add Project' in the Projects page to get started",
      status: "Todo" as TaskStatus,
      priority: "Medium" as TaskPriority,
      projectId: projectData[0].id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Explore the Knowledge Galaxy",
      description: "Check out the graph visualization of your content",
      status: "Todo" as TaskStatus,
      priority: "Low" as TaskPriority,
      projectId: projectData[0].id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Set up your first backup",
      description: "Go to Settings > Data Management to create a backup",
      status: "Todo" as TaskStatus,
      priority: "High" as TaskPriority,
      projectId: projectData[0].id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    }
  ];
  
  // Create all tasks
  for (const task of tasks) {
    await Task.create(task);
  }

  // Create introductory notes
  const notes = [
    {
      title: "TaskSphere Quick Tips",
      content: "## Welcome to TaskSphere!\n\n**Quick Tips:**\n\n- Use the sidebar for navigation\n- Create projects to organize related tasks\n- The Knowledge Galaxy visualizes connections\n- Use priority levels to focus your work\n- Regular backups keep your data safe",
      projectId: projectData[0].id,
      userId: "local-user"
    },
    {
      title: "Keyboard Shortcuts",
      content: "# TaskSphere Keyboard Shortcuts\n\n- **N**: Create new task\n- **P**: Create new project\n- **Ctrl+B**: Toggle sidebar\n- **Ctrl+F**: Search\n- **Ctrl+S**: Save current item\n- **Esc**: Close dialogs",
      projectId: projectData[0].id,
      userId: "local-user"
    }
  ];
  
  // Create all notes
  for (const note of notes) {
    await Note.create(note);
  }

  // Create one standalone task
  await Task.create({
    title: "Check out the calendar view",
    description: "See all your scheduled items in one place",
    status: "Todo" as TaskStatus,
    priority: "Low" as TaskPriority,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "local-user"
  });
  
  return true;
};
