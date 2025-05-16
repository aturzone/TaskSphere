
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FolderKanban, Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/utils';
import { Progress } from '@/components/ui/progress';
import { ProjectStepsDialog } from './ProjectStepsDialog';

interface ProjectCardProps {
  project: any;
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onSelect }) => {
  return (
    <Card className="overflow-hidden border border-border h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 relative pt-3" style={{ backgroundColor: `${project.color}20` }}>
        <div 
          className="absolute top-0 left-0 h-1 w-full" 
          style={{ backgroundColor: project.color }}
        ></div>
        
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-4 h-4 rounded-sm" 
            style={{ backgroundColor: project.color }}
          ></div>
          <h3 
            className="font-semibold text-lg truncate flex-grow cursor-pointer"
            onClick={() => onSelect(project.id)}
          >
            {project.title}
          </h3>
        </div>
        
        <div className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {project.description || 'No description'}
        </div>
      </CardHeader>
      
      <CardContent className="py-3 flex-grow">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress:</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
        
        <div className="mt-4 space-y-2">
          {project.startDate && (
            <div className="flex items-center text-sm gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Start:</span> 
              <span>{formatDate(project.startDate)}</span>
            </div>
          )}
          
          {project.endDate && (
            <div className="flex items-center text-sm gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">End:</span> 
              <span>{formatDate(project.endDate)}</span>
            </div>
          )}
          
          {project.reminderDate && (
            <div className="flex items-center text-sm gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Reminder:</span> 
              <span>{formatDate(project.reminderDate)} {project.reminderTime || ''}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span>Tasks: {project.taskCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-pink-500"></div>
            <span>Notes: {project.noteCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>Completed: {project.completedTaskCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <span>Steps: {project.stepCount || 0}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 border-t flex justify-between items-center">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onSelect(project.id)}
            className="h-8 w-8 rounded-full"
            title="View Tasks"
          >
            <FolderKanban className="h-4 w-4" />
          </Button>
          
          <ProjectStepsDialog 
            projectId={project.id} 
            projectTitle={project.title} 
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(project)}
            className="h-8 w-8 rounded-full"
            title="Edit Project"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(project.id)}
            className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete Project"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
