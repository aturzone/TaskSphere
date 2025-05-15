
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Project } from '@/entities/Project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  reminderDate: z.date().optional().nullable(),
  reminderTime: z.string().optional(),
});

interface ProjectFormDialogProps {
  project?: any;
  onSave: () => void;
  triggerButton: React.ReactNode;
}

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({ project, onSave, triggerButton }) => {
  const { toast } = useToast();
  const { currentUser } = useAppLevelAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: null,
      endDate: null,
      reminderDate: null,
      reminderTime: '',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title || '',
        description: project.description || '',
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
        reminderDate: project.reminderDate ? new Date(project.reminderDate) : null,
        reminderTime: project.reminderTime || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        startDate: null,
        endDate: null,
        reminderDate: null,
        reminderTime: '',
      });
    }
  }, [project, form, isOpen]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!currentUser) return;
    
    try {
      const projectData = {
        title: data.title,
        description: data.description,
        userId: currentUser.id,
        startDate: data.startDate ? data.startDate.toISOString() : undefined,
        endDate: data.endDate ? data.endDate.toISOString() : undefined,
        reminderDate: data.reminderDate ? data.reminderDate.toISOString() : undefined,
        reminderTime: data.reminderTime,
      };
      
      if (project) {
        await Project.update(project.id, projectData);
        toast({
          title: 'Project updated',
          description: 'The project has been updated successfully',
        });
      } else {
        await Project.create(projectData);
        toast({
          title: 'Project created',
          description: 'The project has been created successfully',
        });
      }
      setIsOpen(false);
      onSave();
      
      // Send notification if reminder is set and it's today or in the future
      if (data.reminderDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reminderDay = new Date(data.reminderDate);
        reminderDay.setHours(0, 0, 0, 0);
        
        if (reminderDay >= today) {
          // Schedule notification
          const projectTitle = data.title;
          const notificationTitle = project ? 'Project Reminder' : 'New Project Created';
          const notificationMessage = `${projectTitle}: ${data.description?.substring(0, 50) || 'No description'}`;
          
          // This would typically go to a notification system, but for now we'll use toast
          toast({
            title: notificationTitle,
            description: notificationMessage,
          });
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save project',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
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
                    <Input
                      id="title"
                      placeholder="Project title"
                      {...field}
                    />
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
                    <Textarea
                      id="description"
                      placeholder="Project description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
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
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
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
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return startDate ? date < startDate : false;
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Button type="submit">{project ? 'Update Project' : 'Create Project'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
