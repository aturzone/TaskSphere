
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Task, TaskStatus, TaskPriority } from '@/entities/Task';
import { cn } from '@/lib/utils';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['Todo', 'InProgress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.date().optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  projectId: z.string().optional(),
  reminderDate: z.date().optional().nullable(),
  reminderTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any;
  projectId?: string;
  onSave?: () => void;
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({ isOpen, onOpenChange, task, projectId, onSave }) => {
  const { currentUser } = useAppLevelAuth();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'Todo' as TaskStatus,
      priority: 'Medium' as TaskPriority,
      dueDate: null,
      startTime: '',
      endTime: '',
      projectId: projectId || '',
      reminderDate: null,
      reminderTime: '',
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        projectId: task.projectId || '',
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
        reminderTime: task.reminderTime || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        dueDate: null,
        startTime: '',
        endTime: '',
        projectId: projectId || '',
        reminderDate: null,
        reminderTime: '',
      });
    }
  }, [task, projectId, form, isOpen]);

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) return;
    
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        projectId: data.projectId,
        userId: currentUser.id,
        reminderDate: data.reminderDate ? data.reminderDate.toISOString() : undefined,
        reminderTime: data.reminderTime,
      };
      
      if (task && task.id) {
        await Task.update(task.id, taskData);
        toast({
          title: 'Task updated',
          description: 'The task has been updated successfully',
        });
      } else {
        await Task.create(taskData);
        toast({
          title: 'Task created',
          description: 'The task has been created successfully',
        });
      }
      
      // Send notification if reminder is set and it's today or in the future
      if (data.reminderDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reminderDay = new Date(data.reminderDate);
        reminderDay.setHours(0, 0, 0, 0);
        
        if (reminderDay >= today) {
          // Schedule notification
          const taskTitle = data.title;
          const notificationTitle = task ? 'Task Reminder' : 'New Task Created';
          const notificationMessage = `${taskTitle}: ${data.description?.substring(0, 50) || 'No description'}`;
          
          // This would typically go to a notification system, but for now we'll use toast
          toast({
            title: notificationTitle,
            description: notificationMessage,
          });
        }
      }
      
      onOpenChange(false);
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save task',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update the details of your task.' : 'Add a new task to your list.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Todo">To Do</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reminderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Reminder Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Set reminder date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reminderTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">{task ? 'Update Task' : 'Create Task'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
