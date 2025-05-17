
import { Project } from '@/entities/Project';
import { Task } from '@/entities/Task';
import { Note } from '@/entities/Note';

export interface BackupOptions {
  includeProjects: boolean;
  includeTasks: boolean;
  includeNotes: boolean;
  includeConnections: boolean;
}

interface BackupData {
  version: number;
  timestamp: string;
  options: BackupOptions;
  data: {
    projects?: any[];
    tasks?: any[];
    notes?: any[];
    connections?: any[];
  };
}

const BACKUP_VERSION = 1;
const CONNECTIONS_KEY = 'graph-connections';

// Helper to strip system-generated fields before re-inserting
const stripSystemFields = (entity: any) => {
  const { id, createdAt, creatorId, ...rest } = entity;
  return rest;
};

export const exportData = async (options: BackupOptions): Promise<string> => {
  let projects: any[] = [];
  let tasks: any[] = [];
  let notes: any[] = [];
  let connections: any[] = [];
  
  if (options.includeProjects) {
    projects = await Project.list();
  }
  
  if (options.includeTasks) {
    tasks = await Task.list();
  }
  
  if (options.includeNotes) {
    notes = await Note.list();
  }

  if (options.includeConnections) {
    // Retrieve graph connections from localStorage
    const connectionsData = localStorage.getItem(CONNECTIONS_KEY);
    if (connectionsData) {
      try {
        connections = JSON.parse(connectionsData);
        console.log("Exported graph connections:", connections.length);
      } catch (error) {
        console.error("Error parsing connections data:", error);
        connections = [];
      }
    }
  }

  const backupData: BackupData = {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    options,
    data: {
      ...(options.includeProjects && { projects }),
      ...(options.includeTasks && { tasks }),
      ...(options.includeNotes && { notes }),
      ...(options.includeConnections && { connections }),
    },
  };

  return JSON.stringify(backupData, null, 2);
};

export const importData = async (
  jsonData: string, 
  options: BackupOptions
): Promise<{ success: boolean; message: string; errors?: any[] }> => {
  try {
    const backupData: BackupData = JSON.parse(jsonData);

    if (backupData.version !== BACKUP_VERSION) {
      return { success: false, message: `Unsupported backup version. Expected ${BACKUP_VERSION}, got ${backupData.version}.` };
    }

    const errors: any[] = [];
    const oldIdToNewIdMap: Record<string, string> = {};

    // Clear and import Projects if selected
    if (options.includeProjects && backupData.data.projects) {
      // Clear existing projects
      const existingProjects = await Project.list();
      for (const p of existingProjects) { await Project.delete(p.id); }
      
      // Import projects from backup
      for (const project of backupData.data.projects) {
        try {
          const newProject = await Project.create(stripSystemFields(project));
          if (project.id) oldIdToNewIdMap[`project-${project.id}`] = newProject.id;
        } catch (e) {
          errors.push({ type: 'project', originalId: project.id, error: (e as Error).message });
        }
      }
    }

    // Clear and import Tasks if selected
    if (options.includeTasks && backupData.data.tasks) {
      // Clear existing tasks
      const existingTasks = await Task.list();
      for (const t of existingTasks) { await Task.delete(t.id); }
      
      // Import tasks from backup - handle possible dependencies
      const tasksToProcess = [...backupData.data.tasks];
      let processedTasksThisPass = -1;
      let remainingTasks = tasksToProcess.length;

      while (remainingTasks > 0 && processedTasksThisPass !== 0) {
        processedTasksThisPass = 0;
        const stillToProcess: any[] = [];

        for (const task of tasksToProcess) {
          let canProcess = true;
          const taskData = stripSystemFields(task);

          if (task.projectId) {
            if (oldIdToNewIdMap[`project-${task.projectId}`]) {
              taskData.projectId = oldIdToNewIdMap[`project-${task.projectId}`];
            } else if (options.includeProjects) {
              // Project might not exist or failed to import
              taskData.projectId = undefined; 
            }
          }

          if (task.parentId) {
            if (oldIdToNewIdMap[`task-${task.parentId}`]) {
              taskData.parentId = oldIdToNewIdMap[`task-${task.parentId}`];
            } else {
              // Parent task not yet processed or doesn't exist
              canProcess = false; 
            }
          }
          
          if (canProcess) {
            try {
              const newTask = await Task.create(taskData);
              if (task.id) oldIdToNewIdMap[`task-${task.id}`] = newTask.id;
              processedTasksThisPass++;
            } catch (e) {
              errors.push({ type: 'task', originalId: task.id, error: (e as Error).message });
            }
          } else {
            stillToProcess.push(task);
          }
        }
        
        tasksToProcess.length = 0; // Clear array
        tasksToProcess.push(...stillToProcess); // Repopulate with unprocessed tasks
        remainingTasks = tasksToProcess.length;

        if (processedTasksThisPass === 0 && remainingTasks > 0) {
          // Circular dependency or missing parent, mark remaining as errors
          tasksToProcess.forEach(task => errors.push({ 
            type: 'task', 
            originalId: task.id, 
            error: 'Could not process due to missing/circular parent or other dependency.' 
          }));
          break;
        }
      }
    }

    // Clear and import Notes if selected
    if (options.includeNotes && backupData.data.notes) {
      // Clear existing notes
      const existingNotes = await Note.list();
      for (const n of existingNotes) { await Note.delete(n.id); }
      
      // Import notes from backup
      for (const note of backupData.data.notes) {
        try {
          const noteData = stripSystemFields(note);
          
          if (note.projectId) {
            if (oldIdToNewIdMap[`project-${note.projectId}`]) {
              noteData.projectId = oldIdToNewIdMap[`project-${note.projectId}`];
            } else if (options.includeProjects) {
              noteData.projectId = undefined;
            }
          }

          if (note.linkedTaskIds && Array.isArray(note.linkedTaskIds)) {
            noteData.linkedTaskIds = note.linkedTaskIds
              .map((oldTaskId: string) => oldIdToNewIdMap[`task-${oldTaskId}`])
              .filter((newTaskId: string | undefined) => newTaskId !== undefined); // Filter out unresolved links
          } else {
            noteData.linkedTaskIds = [];
          }
          
          const newNote = await Note.create(noteData);
          if (note.id) oldIdToNewIdMap[`note-${note.id}`] = newNote.id;
        } catch (e) {
          errors.push({ type: 'note', originalId: note.id, error: (e as Error).message });
        }
      }
    }

    // Import graph connections if selected
    if (options.includeConnections && backupData.data.connections) {
      try {
        // First update both IndexedDB and localStorage
        localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(backupData.data.connections));
        
        // Also attempt to update IndexedDB if available
        if (window.indexedDB) {
          const request = indexedDB.open('KnowledgeGalaxyDB', 1);
          
          request.onsuccess = (event) => {
            try {
              const db = request.result;
              const tx = db.transaction('connections', 'readwrite');
              const store = tx.objectStore('connections');

              // Clear existing data first
              store.clear();
              
              // Add all connections from backup
              backupData.data.connections.forEach((conn: any) => {
                store.add(conn);
              });
              
              console.log("Successfully updated IndexedDB with imported connections:", backupData.data.connections.length);
            } catch (dbError) {
              console.error("Error updating IndexedDB during import:", dbError);
            }
          };
          
          request.onerror = () => {
            console.error("IndexedDB error during connection import:", request.error);
          };
        }
        
        console.log("Successfully imported graph connections:", backupData.data.connections.length);
      } catch (e) {
        errors.push({ 
          type: 'connections', 
          error: `Failed to save graph connections: ${(e as Error).message}` 
        });
      }
    }

    if (errors.length > 0) {
      return { 
        success: true, 
        message: `Import completed with ${errors.length} warning(s). Some items might be missing or incomplete.`, 
        errors 
      };
    }

    return { success: true, message: 'Data imported successfully.' };

  } catch (error) {
    console.error("Error during import:", error);
    return { success: false, message: `Import failed: ${(error as Error).message}` };
  }
};

// Helper function to download backup file
export const downloadBackupFile = (data: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};
