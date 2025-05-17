import React, { useState, useEffect } from 'react';
import { Project } from '@/entities/Project';
import { Task } from '@/entities/Task';
import { Note } from '@/entities/Note';
import { ProjectStep } from '@/entities/ProjectStep';
import ProjectCard from '@/components/ProjectCard';
import ProjectFormDialogEnhanced from '@/components/ProjectFormDialogEnhanced';
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
import { createTestData } from '@/utils/testData';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState<{[key: string]: {tasks: number, notes: number, completed: number, steps: number, progress: number}}>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [hasInitializedTestData, setHasInitializedTestData] = useState(false);

  const { toast } = useToast();
  const { isFirstLoad, currentUser } = useAppLevelAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      // Initialize test data if it's the first time
      const hasTestData = localStorage.getItem('test-data-initialized');
      if (!hasTestData && !hasInitializedTestData) {
        createTestData();
        localStorage.setItem('test-data-initialized', 'true');
        setHasInitializedTestData(true);
        toast({
          title: "Test Data Created",
          description: "Sample projects and tasks have been created for demonstration."
        });
      }
      
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
      const stats: {[key: string]: {tasks: number, notes: number, completed: number, steps: number, progress: number}} = {};
      
      for (const project of fetchedProjects) {
        const tasks = await Task.filter({ projectId: project.id });
        const notes = await Note.filter({ projectId: project.id });
        const steps = await ProjectStep.getByProjectId(project.id);
        const completedTasks = tasks.filter(task => task.status === 'Done').length;
        
        // Calculate progress based on steps if they exist, otherwise based on tasks
        let progress = 0;
        if (steps.length > 0) {
          const totalWeight = steps.reduce((sum, step) => sum + step.weightPercentage, 0);
          const completedWeight = steps
            .filter(step => step.status === 'Done')
            .reduce((sum, step) => sum + step.weightPercentage, 0);
          progress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
        } else if (tasks.length > 0) {
          progress = Math.round((completedTasks / tasks.length) * 100);
        }
        
        stats[project.id] = {
          tasks: tasks.length,
          notes: notes.length,
          completed: completedTasks,
          steps: steps.length,
          progress: progress
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
    setShowProjectForm(true);
  };
  
  const handleDeleteProjectAttempt = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      // Delete associated project steps first
      await ProjectStep.deleteByProjectId(projectToDelete);
      
      // Then delete the project
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
    completedTaskCount: projectStats[project.id]?.completed || 0,
    stepCount: projectStats[project.id]?.steps || 0,
    progress: projectStats[project.id]?.progress || 0
  }));

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FolderKanban className="mr-3 h-8 w-8 text-primary" />
          Projects
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/graph')}
          >
            View Knowledge Galaxy
          </Button>
          <ProjectFormDialogEnhanced
            project={editingProject}
            isOpen={showProjectForm}
            onOpenChange={setShowProjectForm}
            onSave={() => {
              fetchProjects();
              setEditingProject(null);
              setShowProjectForm(false);
            }}
          />
          <Button onClick={() => {
            setEditingProject(null);
            setShowProjectForm(true);
          }}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add Project
          </Button>
        </div>
      </div>

      {enhancedProjects.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <FolderKanban size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">No Projects Yet</h2>
          <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
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
              and all associated tasks, notes, and steps.
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
