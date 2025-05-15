
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileEdit, Trash2, Calendar, ArrowRight, Bell } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    color?: string;
    taskCount?: number;
    noteCount?: number;
    completedTaskCount?: number;
    startDate?: string;
    endDate?: string;
    reminderDate?: string;
    reminderTime?: string;
  };
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onSelect }) => {
  const {
    id,
    title,
    description,
    color = '#3B82F6',
    taskCount = 0,
    noteCount = 0,
    completedTaskCount = 0,
    startDate,
    endDate,
    reminderDate,
    reminderTime,
  } = project;

  const hasReminder = reminderDate && isValid(parseISO(reminderDate));
  const hasDateRange = startDate && endDate && isValid(parseISO(startDate)) && isValid(parseISO(endDate));
  const progressPercentage = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <CardTitle className="font-semibold text-lg line-clamp-1">{title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{description || 'No description'}</p>
        
        {hasDateRange && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(parseISO(startDate), 'MMM d, yyyy')} - {format(parseISO(endDate), 'MMM d, yyyy')}
            </span>
          </div>
        )}
        
        {hasReminder && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Bell className="h-3.5 w-3.5" />
            <span>
              Reminder: {format(parseISO(reminderDate), 'MMM d, yyyy')}
              {reminderTime && ` at ${reminderTime}`}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Badge variant="outline" className="flex justify-center py-0.5">
              Tasks: {taskCount}
            </Badge>
            <Badge variant="outline" className="flex justify-center py-0.5">
              Notes: {noteCount}
            </Badge>
          </div>
        </div>
        
        {taskCount > 0 && (
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-1 flex justify-between">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full", 
                  progressPercentage === 100 
                    ? "bg-green-500" 
                    : progressPercentage > 50 
                      ? "bg-amber-500" 
                      : "bg-blue-600"
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t flex justify-between">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 flex items-center gap-1"
          onClick={() => onSelect(id)}
        >
          View Tasks
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
