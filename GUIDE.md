
# Developer Guide for TaskFlow App

This guide provides technical information and architecture details for developers working on or extending the TaskFlow application.

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: Shadcn UI (based on Tailwind CSS)
- **State Management**: React hooks and context
- **Data Storage**: Local storage (browser-based)
- **Routing**: React Router

## Project Structure

The project follows a modular architecture organized by feature:

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   └── ...             # App-specific components
├── entities/           # Data models and storage logic
│   ├── Project.ts
│   ├── Task.ts
│   └── Note.ts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── pages/              # Page components for routing
├── services/           # Business logic services
└── utils.ts            # General utilities
```

## Data Models

### Project

```typescript
interface ProjectProps {
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
```

### Task

```typescript
interface TaskProps {
  id?: string;
  title: string;
  description?: string;
  status: TaskStatus; // 'Todo' | 'InProgress' | 'Done'
  priority: TaskPriority; // 'Low' | 'Medium' | 'High'
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
```

### Note

```typescript
interface NoteProps {
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
```

## Storage Implementation

The application uses browser's `localStorage` for data persistence. Each entity type has its own static methods for CRUD operations:

```typescript
// Example for Project entity
static async create(projectData: ProjectProps): Promise<Project> {
  const project = new Project(projectData);
  const projects = this.getStore();
  projects.push(project);
  this.setStore(projects);
  return project;
}

// Similar methods exist for update, delete, filter, list, etc.
```

## Backup & Restore System

The backup system allows selective export and import of data:

```typescript
interface BackupOptions {
  includeProjects: boolean;
  includeTasks: boolean;
  includeNotes: boolean;
}

interface BackupData {
  version: number;
  timestamp: string;
  options: BackupOptions;
  data: {
    projects?: any[];
    tasks?: any[];
    notes?: any[];
  };
}
```

## Adding New Features

### Adding a New Entity Type

1. Create a new file in `src/entities/` following the pattern of existing entities
2. Implement the same interface (CRUD operations, local storage)
3. Update the backup/restore service to include the new entity type

### Adding UI Components

Use Shadcn UI components as building blocks:

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// etc.
```

### Calendar Integration

New entity types that need calendar representation should:

1. Include date fields (ISO string format)
2. Add display logic in the CalendarPage component
3. Convert between date objects and ISO strings appropriately

## Notifications System

The notification system works by:

1. Checking entities with reminder dates/times 
2. Comparing with current date/time
3. Creating notifications for relevant items
4. Displaying them in the NotificationBell component

To extend with real push notifications, modify the NotificationBell component.

## Future Development

Planned features for future versions:

- **Version 2**:
  - Collaborative features
  - Data synchronization between devices
  - Advanced filtering and search

- **Version 3**:
  - User authentication system
  - Cloud storage
  - API integration with other productivity tools

## Performance Considerations

- Keep entity lists reasonably sized for localStorage performance
- Consider implementing pagination for large data sets
- Optimize calendar view rendering for performance with many items

## Testing

For unit testing components and services:

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```
