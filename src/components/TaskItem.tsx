
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '@/utils';

interface TaskItemProps {
  task: any;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const isCompleted = task.status === 'Done';
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${isCompleted ? 'opacity-75' : ''}`}>
      <CardContent className="p-3 flex items-start">
        <Checkbox 
          className="mt-1 mr-3"
          checked={isCompleted}
          onCheckedChange={(checked) => onToggleComplete(task.id, !!checked)}
        />
        
        <div className="flex-grow mr-2">
          <h3 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            {task.priority && (
              <Badge className={`${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
            )}
            
            {task.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(task.dueDate)}
              </div>
            )}
            
            {task.projectName && (
              <div className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {task.projectName}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
