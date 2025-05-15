
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
import { Note } from '@/entities/Note';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  projectId: z.string().optional(),
  noteDate: z.date().optional().nullable(),
  reminderDate: z.date().optional().nullable(),
  reminderTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NoteFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  note?: any;
  projectId?: string;
  onSave?: () => void;
}

const NoteFormDialog: React.FC<NoteFormDialogProps> = ({ isOpen, onOpenChange, note, projectId, onSave }) => {
  const { currentUser } = useAppLevelAuth();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      projectId: projectId || '',
      noteDate: null,
      reminderDate: null,
      reminderTime: '',
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content || '',
        projectId: note.projectId || '',
        noteDate: note.noteDate ? new Date(note.noteDate) : null,
        reminderDate: note.reminderDate ? new Date(note.reminderDate) : null,
        reminderTime: note.reminderTime || '',
      });
    } else {
      form.reset({
        title: '',
        content: '',
        projectId: projectId || '',
        noteDate: new Date(),
        reminderDate: null,
        reminderTime: '',
      });
    }
  }, [note, projectId, form, isOpen]);

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) return;
    
    try {
      const noteData = {
        title: data.title,
        content: data.content,
        projectId: data.projectId,
        userId: currentUser.id,
        noteDate: data.noteDate ? data.noteDate.toISOString() : new Date().toISOString(),
        reminderDate: data.reminderDate ? data.reminderDate.toISOString() : undefined,
        reminderTime: data.reminderTime,
      };
      
      if (note && note.id) {
        await Note.update(note.id, noteData);
        toast({
          title: 'Note updated',
          description: 'The note has been updated successfully',
        });
      } else {
        await Note.create(noteData);
        toast({
          title: 'Note created',
          description: 'The note has been created successfully',
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
          const noteTitle = data.title;
          const notificationTitle = note ? 'Note Reminder' : 'New Note Created';
          const notificationMessage = `${noteTitle}: ${data.content?.substring(0, 50) || 'No content'}`;
          
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
      console.error('Error saving note:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save note',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Create Note'}</DialogTitle>
          <DialogDescription>
            {note ? 'Update the contents of your note.' : 'Add a new note.'}
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
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Note content" 
                      {...field} 
                      className="min-h-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="noteDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Note Date</FormLabel>
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
              <Button type="submit">{note ? 'Update Note' : 'Create Note'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteFormDialog;
