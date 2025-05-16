
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BarChart2 } from 'lucide-react';
import ProjectStepsList from './ProjectStepsList';
import { ProjectStep } from '@/entities/ProjectStep';
import { useToast } from '@/components/ui/use-toast';
import { Project } from '@/entities/Project';

interface ProjectStepsDialogProps {
  projectId: string;
  projectTitle: string;
}

export const ProjectStepsDialog: React.FC<ProjectStepsDialogProps> = ({ projectId, projectTitle }) => {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<ProjectStep[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch steps when dialog opens
  useEffect(() => {
    if (open) {
      fetchSteps();
    }
  }, [open, projectId]);

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const projectSteps = await ProjectStep.getByProjectId(projectId);
      setSteps(projectSteps);
      
      // Update the project with the steps data for persistence
      await updateProjectWithSteps(projectSteps);
    } catch (error) {
      console.error("Failed to fetch steps:", error);
      toast({
        title: "Error",
        description: "Could not load project steps. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update project entity with steps data for persistence
  const updateProjectWithSteps = async (steps: ProjectStep[]) => {
    try {
      const project = await Project.get(projectId);
      if (project) {
        // Create a serialized version of the steps to store with the project
        const serializedSteps = steps.map(step => ({
          id: step.id,
          title: step.title,
          description: step.description,
          weightPercentage: step.weightPercentage,
          status: step.status,
          createdAt: step.createdAt,
          updatedAt: step.updatedAt
        }));
        
        // Update the project with the steps data
        await Project.update(projectId, { 
          steps: serializedSteps 
        });
      }
    } catch (error) {
      console.error("Failed to update project with steps:", error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-primary hover:text-primary hover:bg-primary/10 rounded-full h-8 w-8 p-0"
        title="View Project Steps"
      >
        <BarChart2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Project Steps: {projectTitle}</DialogTitle>
            <DialogDescription>
              Define and track progress of individual steps for this project
            </DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="py-4 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading steps...</p>
            </div>
          ) : (
            <ProjectStepsList 
              projectId={projectId} 
              steps={steps} 
              onStepsChange={fetchSteps} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
