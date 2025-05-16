
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project } from '@/entities/Project';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Task } from '@/entities/Task';
import { Note } from '@/entities/Note';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface ProjectFormDialogProps {
  triggerButton?: React.ReactNode;
  project?: any;
  onSave: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({ 
  triggerButton, 
  project, 
  onSave,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  // Use either the external or internal open state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setColor(project.color || '#8B5CF6');
      
      if (project.startDate) {
        setStartDate(new Date(project.startDate));
      }
      
      if (project.endDate) {
        setEndDate(new Date(project.endDate));
      }
    }
  }, [project, open]);

  useEffect(() => {
    if (open) {
      fetchTasksAndNotes();
    }
  }, [open]);

  const fetchTasksAndNotes = async () => {
    try {
      const allTasks = await Task.getAll();
      const allNotes = await Note.getAll();
      
      setTasks(allTasks);
      setNotes(allNotes);
      
      // If editing, fetch related tasks and notes
      if (project?.id) {
        const projectTasks = allTasks.filter(task => task.projectId === project.id);
        const projectNotes = allNotes.filter(note => note.projectId === project.id);
        
        setSelectedTasks(projectTasks.map(task => task.id));
        setSelectedNotes(projectNotes.map(note => note.id));
      }
    } catch (error) {
      console.error('Error fetching tasks and notes:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        toast({
          title: "Error",
          description: "Project title is required.",
          variant: "destructive"
        });
        return;
      }

      const projectData = {
        title,
        description,
        color,
        userId: 'local-user', // Using default user for now
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      };

      let savedProject;
      if (project?.id) {
        savedProject = await Project.update(project.id, projectData);
      } else {
        savedProject = await Project.create(projectData);
      }

      if (savedProject) {
        // Update task assignments
        for (const task of tasks) {
          const shouldBeAssigned = selectedTasks.includes(task.id);
          const isCurrentlyAssigned = task.projectId === savedProject.id;
          
          if (shouldBeAssigned && !isCurrentlyAssigned) {
            await Task.update(task.id, { projectId: savedProject.id });
          } else if (!shouldBeAssigned && isCurrentlyAssigned) {
            await Task.update(task.id, { projectId: undefined });
          }
        }
        
        // Update note assignments
        for (const note of notes) {
          const shouldBeAssigned = selectedNotes.includes(note.id);
          const isCurrentlyAssigned = note.projectId === savedProject.id;
          
          if (shouldBeAssigned && !isCurrentlyAssigned) {
            await Note.update(note.id, { projectId: savedProject.id });
          } else if (!shouldBeAssigned && isCurrentlyAssigned) {
            await Note.update(note.id, { projectId: undefined });
          }
        }

        toast({
          title: "Success",
          description: `Project ${project?.id ? 'updated' : 'created'} successfully.`,
        });
        
        setOpen(false);
        resetForm();
        onSave();
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast({
        title: "Error",
        description: `Could not ${project?.id ? 'update' : 'create'} project.`,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setColor('#8B5CF6');
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedTasks([]);
    setSelectedNotes([]);
    setActiveTab('details');
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  const handleToggleNote = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId) 
        : [...prev, noteId]
    );
  };

  const colors = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EC4899', // Pink
    '#EF4444', // Red
  ];

  return (
    <>
      {triggerButton && (
        <div onClick={() => setOpen(true)}>
          {triggerButton}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{project?.id ? 'Edit Project' : 'Create Project'}</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setOpen(false)} 
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Project title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Project description (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <div
                        key={c}
                        className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                          color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => 
                            startDate ? date < startDate : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4">
              <div className="font-medium text-sm">Link Tasks to Project</div>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {tasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No tasks available</div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`task-${task.id}`}
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => handleToggleTask(task.id)}
                        />
                        <Label 
                          htmlFor={`task-${task.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {task.title}
                          <span className="ml-2 text-xs text-muted-foreground capitalize">
                            ({task.status})
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <div className="font-medium text-sm">Link Notes to Project</div>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {notes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No notes available</div>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`note-${note.id}`}
                          checked={selectedNotes.includes(note.id)}
                          onCheckedChange={() => handleToggleNote(note.id)}
                        />
                        <Label 
                          htmlFor={`note-${note.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {note.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {project?.id ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectFormDialog;
