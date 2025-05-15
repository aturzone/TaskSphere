import React, { useState, useEffect } from 'react';
import { Project } from '@/entities/Project';
import { Task } from '@/entities/Task';
import { Note } from '@/entities/Note';
import ProjectCard from '@/components/ProjectCard';
import ProjectFormDialog from '@/components/ProjectFormDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, FolderKanban, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState<{[key: string]: {tasks: number, notes: number, completed: number}}>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const { isFirstLoad, currentUser } = useAppLevelAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const fetchProjects = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const fetchedProjects = await Project.list("createdAt:desc");
      setProjects(fetchedProjects);
      
      // Get stats for each project
      const stats: {[key: string]: {tasks: number, notes: number, completed: number}} = {};
      
      for (const project of fetchedProjects) {
        const tasks = await Task.filter({ projectId: project.id });
        const notes = await Note.filter({ projectId: project.id });
        const completedTasks = tasks.filter(task => task.status === 'Done').length;
        
        stats[project.id] = {
          tasks: tasks.length,
          notes: notes.length,
          completed: completedTasks
        };
      }
      
      setProjectStats(stats);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast({ title: "Error", description: "Could not load projects.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
  };
  
  const handleDeleteProjectAttempt = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await Project.delete(projectToDelete);
      toast({ title: "Project Deleted", description: "The project has been successfully deleted." });
      fetchProjects(); // Refresh list
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({ title: "Error", description: "Could not delete the project.", variant: "destructive" });
    } finally {
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    }
  };
  
  const handleProjectSelect = (projectId: string) => {
    navigate(`/tasks?projectId=${projectId}`);
  };

  if (isFirstLoad) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Enhance projects with stats
  const enhancedProjects = projects.map(project => ({
    ...project,
    taskCount: projectStats[project.id]?.tasks || 0,
    noteCount: projectStats[project.id]?.notes || 0,
    completedTaskCount: projectStats[project.id]?.completed || 0
  }));

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FolderKanban className="mr-3 h-8 w-8 text-primary" />
          Projects
        </h1>
        <ProjectFormDialog
          project={editingProject}
          onSave={() => {
            fetchProjects();
            setEditingProject(null); // Reset editing project
          }}
          triggerButton={
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Project
            </Button>
          }
        />
      </div>

      {enhancedProjects.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <FolderKanban size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">No Projects Yet</h2>
          <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
          {/* The ProjectFormDialog above serves as the primary way to add a project */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enhancedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProjectAttempt}
              onSelect={handleProjectSelect}
            />
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated tasks and notes (if cascading delete is implemented).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default ProjectsPage;
