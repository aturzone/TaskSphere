
import { Project } from '@/entities/Project';
import { ProjectStep } from '@/entities/ProjectStep';
import { Task, TaskStatus, TaskPriority } from '@/entities/Task';
import { Note } from '@/entities/Note';

export const createTestData = async () => {
  // Create test projects
  const projects = [
    {
      title: "Build a Robot",
      description: "Create a robot with basic movement capabilities",
      color: "#8B5CF6",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      userId: "local-user"
    },
    {
      title: "Learn Machine Learning",
      description: "Study machine learning fundamentals and implement basic models",
      color: "#3B82F6",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      userId: "local-user"
    },
    {
      title: "Garden Project",
      description: "Design and create a small vegetable garden",
      color: "#10B981",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      userId: "local-user"
    }
  ];

  const projectData = [];
  
  // Create projects and store the results
  for (const project of projects) {
    const newProject = await Project.create(project);
    projectData.push(newProject);
  }

  // Create steps for each project
  const projectSteps = [
    // Robot Project Steps
    {
      projectId: projectData[0].id,
      title: "Research Components",
      description: "Research and select appropriate components for the robot",
      weightPercentage: 20,
      status: "Done" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[0].id,
      title: "Design Robot Frame",
      description: "Create the physical frame design and diagrams",
      weightPercentage: 25,
      status: "InProgress" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[0].id,
      title: "Build Prototype",
      description: "Assemble the robot hardware",
      weightPercentage: 35,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[0].id,
      title: "Program Controllers",
      description: "Write software to control the robot",
      weightPercentage: 20,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    
    // Machine Learning Project Steps
    {
      projectId: projectData[1].id,
      title: "Study Fundamentals",
      description: "Learn basic concepts and algorithms",
      weightPercentage: 30,
      status: "InProgress" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[1].id,
      title: "Practice with Datasets",
      description: "Apply algorithms to standard datasets",
      weightPercentage: 40,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[1].id,
      title: "Build Custom Model",
      description: "Create a machine learning model for a specific problem",
      weightPercentage: 30,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    },
    
    // Garden Project Steps
    {
      projectId: projectData[2].id,
      title: "Plan Garden Layout",
      description: "Design the garden layout and select plants",
      weightPercentage: 15,
      status: "Done" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[2].id,
      title: "Prepare Soil",
      description: "Get soil ready with proper nutrients and conditions",
      weightPercentage: 25,
      status: "Done" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[2].id,
      title: "Plant Seeds/Seedlings",
      description: "Plant according to the planned layout",
      weightPercentage: 40,
      status: "InProgress" as "NotStarted" | "InProgress" | "Done"
    },
    {
      projectId: projectData[2].id,
      title: "Setup Irrigation",
      description: "Install a watering system for the garden",
      weightPercentage: 20,
      status: "NotStarted" as "NotStarted" | "InProgress" | "Done"
    }
  ];
  
  // Create all project steps
  for (const step of projectSteps) {
    await ProjectStep.create(step);
  }

  // Create tasks for each project
  const tasks = [
    // Tasks for Robot Project
    {
      title: "Order robot components",
      description: "Purchase motors, sensors, and controller board",
      status: "Done" as TaskStatus,
      priority: "High" as TaskPriority,
      projectId: projectData[0].id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Sketch robot design",
      description: "Create detailed drawing of robot structure",
      status: "InProgress" as TaskStatus,
      priority: "Medium" as TaskPriority,
      projectId: projectData[0].id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Learn basic electronics",
      description: "Study circuit design and soldering",
      status: "Todo" as TaskStatus,
      priority: "Medium" as TaskPriority,
      projectId: projectData[0].id,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    
    // Tasks for ML Project
    {
      title: "Complete Python refresher",
      description: "Review Python fundamentals needed for ML",
      status: "Done" as TaskStatus,
      priority: "High" as TaskPriority,
      projectId: projectData[1].id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Read 'Introduction to ML'",
      description: "Finish first 5 chapters",
      status: "InProgress" as TaskStatus,
      priority: "Medium" as TaskPriority,
      projectId: projectData[1].id,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Implement linear regression",
      description: "Write code for basic linear regression algorithm",
      status: "Todo" as TaskStatus,
      priority: "Low" as TaskPriority,
      projectId: projectData[1].id,
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    
    // Tasks for Garden Project
    {
      title: "Buy seeds and soil",
      description: "Get organic soil, tomato and basil seeds",
      status: "Done" as TaskStatus,
      priority: "Medium" as TaskPriority,
      projectId: projectData[2].id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Build raised beds",
      description: "Construct two 4x8 raised beds",
      status: "InProgress" as TaskStatus,
      priority: "High" as TaskPriority,
      projectId: projectData[2].id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Research companion planting",
      description: "Learn which plants grow well together",
      status: "Todo" as TaskStatus,
      priority: "Low" as TaskPriority,
      projectId: projectData[2].id,
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    }
  ];
  
  // Create all tasks
  for (const task of tasks) {
    await Task.create(task);
  }

  // Create notes for each project
  const notes = [
    {
      title: "Robot Design Ideas",
      content: "- Consider using Arduino Uno for the main controller\n- Need at least 4 motors for mobility\n- Add ultrasonic sensors for obstacle detection\n- Maybe add a camera module later",
      projectId: projectData[0].id,
      userId: "local-user"
    },
    {
      title: "ML Resources",
      content: "## Good Resources for Machine Learning\n1. Stanford's CS229 course\n2. 'Hands-on Machine Learning with Scikit-Learn'\n3. Kaggle competitions for practice\n4. PyTorch documentation",
      projectId: projectData[1].id,
      userId: "local-user"
    },
    {
      title: "Garden Plant List",
      content: "### Vegetables\n- Tomatoes (Roma and Cherry)\n- Bell peppers\n- Zucchini\n- Lettuce\n\n### Herbs\n- Basil\n- Rosemary\n- Mint (in separate container!)\n\nRemember to rotate crops next season.",
      projectId: projectData[2].id,
      userId: "local-user"
    }
  ];
  
  // Create all notes
  for (const note of notes) {
    await Note.create(note);
  }

  // Create some unassociated tasks
  const generalTasks = [
    {
      title: "Pay utility bills",
      description: "Water, electricity, internet",
      status: "Todo" as TaskStatus,
      priority: "High" as TaskPriority,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    },
    {
      title: "Schedule dentist appointment",
      description: "Need annual checkup",
      status: "Todo" as TaskStatus,
      priority: "Medium" as TaskPriority,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      userId: "local-user"
    }
  ];
  
  // Create general tasks
  for (const task of generalTasks) {
    await Task.create(task);
  }
  
  return true;
};
