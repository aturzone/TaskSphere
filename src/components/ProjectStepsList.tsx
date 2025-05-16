
import React, { useState } from 'react';
import { ProjectStep } from '@/entities/ProjectStep';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProjectStepsListProps {
  projectId: string;
  steps: ProjectStep[];
  onStepsChange: () => void;
}

const ProjectStepsList: React.FC<ProjectStepsListProps> = ({ projectId, steps, onStepsChange }) => {
  const { toast } = useToast();
  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    weightPercentage: 0,
    status: 'NotStarted' as 'NotStarted' | 'InProgress' | 'Done'
  });
  const [isAdding, setIsAdding] = useState(false);

  const totalWeight = steps.reduce((sum, step) => sum + step.weightPercentage, 0);
  const completedWeight = steps
    .filter(step => step.status === 'Done')
    .reduce((sum, step) => sum + step.weightPercentage, 0);
  
  const completionPercentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  const handleAddStep = async () => {
    if (!newStep.title) {
      toast({
        title: "Error",
        description: "Step title is required",
        variant: "destructive"
      });
      return;
    }

    if (newStep.weightPercentage <= 0) {
      toast({
        title: "Error",
        description: "Weight percentage must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    // Check if total percentage would exceed 100%
    const newTotalWeight = totalWeight + newStep.weightPercentage;
    if (newTotalWeight > 100) {
      toast({
        title: "Error",
        description: `Total weight percentage cannot exceed 100%. Available: ${100 - totalWeight}%`,
        variant: "destructive"
      });
      return;
    }

    try {
      await ProjectStep.create({
        projectId,
        title: newStep.title,
        description: newStep.description,
        weightPercentage: newStep.weightPercentage,
        status: newStep.status
      });

      // Reset form and close it
      setNewStep({
        title: '',
        description: '',
        weightPercentage: 0,
        status: 'NotStarted'
      });
      setIsAdding(false);
      onStepsChange();
      
      toast({
        title: "Step added",
        description: "Project step has been added successfully"
      });
    } catch (error) {
      console.error("Failed to add step:", error);
      toast({
        title: "Error",
        description: "Could not add step. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStepStatus = async (stepId: string, status: 'NotStarted' | 'InProgress' | 'Done') => {
    try {
      await ProjectStep.update(stepId, { status });
      onStepsChange();
      toast({
        title: "Step updated",
        description: "Project step status has been updated"
      });
    } catch (error) {
      console.error("Failed to update step:", error);
      toast({
        title: "Error",
        description: "Could not update step status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await ProjectStep.delete(stepId);
      onStepsChange();
      toast({
        title: "Step deleted",
        description: "Project step has been deleted"
      });
    } catch (error) {
      console.error("Failed to delete step:", error);
      toast({
        title: "Error",
        description: "Could not delete step. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NotStarted':
        return 'bg-amber-500/20 text-amber-300';
      case 'InProgress':
        return 'bg-blue-500/20 text-blue-300';
      case 'Done':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Steps</h3>
        <div className="text-sm">
          Total Weight: <Badge variant={totalWeight > 100 ? "destructive" : "outline"}>{totalWeight}%</Badge>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Project Completion</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      )}

      {steps.length === 0 && !isAdding ? (
        <div className="text-center py-6 border border-dashed rounded-md border-muted-foreground/50">
          <p className="text-muted-foreground mb-2">No steps defined for this project yet.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add First Step
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="border rounded-md p-3 bg-secondary/40"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{step.title}</h4>
                    <Badge>{step.weightPercentage}%</Badge>
                    <Badge className={getStatusColor(step.status)}>{step.status}</Badge>
                  </div>
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={step.status} 
                    onValueChange={(value: 'NotStarted' | 'InProgress' | 'Done') => handleUpdateStepStatus(step.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NotStarted">Not Started</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive" 
                    onClick={() => handleDeleteStep(step.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {isAdding ? (
            <div className="border rounded-md p-3 bg-muted/20">
              <h4 className="font-medium mb-3">Add New Step</h4>
              <div className="space-y-3">
                <Input 
                  placeholder="Step Title" 
                  value={newStep.title} 
                  onChange={(e) => setNewStep({...newStep, title: e.target.value})} 
                />
                <Textarea 
                  placeholder="Description (optional)" 
                  value={newStep.description} 
                  onChange={(e) => setNewStep({...newStep, description: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Weight (%)</label>
                    <Input 
                      type="number" 
                      min="1"
                      max={100 - (totalWeight - (newStep.weightPercentage || 0))}
                      placeholder="Weight %" 
                      value={newStep.weightPercentage.toString()} 
                      onChange={(e) => setNewStep({...newStep, weightPercentage: parseInt(e.target.value) || 0})} 
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Available: {100 - (totalWeight - (newStep.weightPercentage || 0))}%
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Status</label>
                    <Select 
                      value={newStep.status} 
                      onValueChange={(value: 'NotStarted' | 'InProgress' | 'Done') => setNewStep({...newStep, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NotStarted">Not Started</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button onClick={handleAddStep}>Add Step</Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => setIsAdding(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Step
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectStepsList;
