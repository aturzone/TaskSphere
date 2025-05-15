import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ListChecks, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Task } from '@/entities/Task';
import { Note } from '@/entities/Note';
import { Project } from '@/entities/Project';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'task' | 'note' | 'project';
  entityId: string;
  dueDate?: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
    // Set up interval to refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const currentDate = new Date();
      const todayStart = new Date(currentDate);
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date(currentDate);
      todayEnd.setHours(23, 59, 59, 999);
      
      // Fetch tasks with reminders
      const tasks = await Task.list();
      const tasksWithReminders = tasks.filter(task => {
        if (!task.reminderDate) return false;
        
        const reminderDate = new Date(task.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        
        // Include tasks with reminders for today or in the past that haven't been read
        return reminderDate <= todayEnd;
      });
      
      // Fetch notes with reminders
      const notes = await Note.list();
      const notesWithReminders = notes.filter(note => {
        if (!note.reminderDate) return false;
        
        const reminderDate = new Date(note.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        
        return reminderDate <= todayEnd;
      });
      
      // Fetch projects with reminders
      const projects = await Project.list();
      const projectsWithReminders = projects.filter(project => {
        if (!project.reminderDate) return false;
        
        const reminderDate = new Date(project.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        
        return reminderDate <= todayEnd;
      });
      
      // Transform tasks into notifications
      const taskNotifications: Notification[] = tasksWithReminders.map(task => ({
        id: `task-${task.id}`,
        title: `Task: ${task.title}`,
        message: task.description || 'No description',
        time: task.reminderDate ? format(new Date(task.reminderDate), 'HH:mm') : 'Today',
        read: false, // Can be stored in local storage in a real app
        type: 'task',
        entityId: task.id,
        dueDate: task.dueDate
      }));
      
      // Transform notes into notifications
      const noteNotifications: Notification[] = notesWithReminders.map(note => ({
        id: `note-${note.id}`,
        title: `Note: ${note.title}`,
        message: note.content?.substring(0, 50) || 'No content',
        time: note.reminderDate ? format(new Date(note.reminderDate), 'HH:mm') : 'Today',
        read: false,
        type: 'note',
        entityId: note.id
      }));
      
      // Transform projects into notifications
      const projectNotifications: Notification[] = projectsWithReminders.map(project => ({
        id: `project-${project.id}`,
        title: `Project: ${project.title}`,
        message: project.description?.substring(0, 50) || 'No description',
        time: project.reminderDate ? format(new Date(project.reminderDate), 'HH:mm') : 'Today',
        read: false,
        type: 'project',
        entityId: project.id,
        dueDate: project.endDate
      }));
      
      // Combine all notifications
      const allNotifications = [...taskNotifications, ...noteNotifications, ...projectNotifications];
      
      // Sort by time
      allNotifications.sort((a, b) => {
        // If we have dates, sort by those
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        // Otherwise sort by the 'time' string
        return a.time.localeCompare(b.time);
      });
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read",
    });
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'task':
        navigate(`/tasks?id=${notification.entityId}`);
        break;
      case 'note':
        navigate(`/notes?id=${notification.entityId}`);
        break;
      case 'project':
        navigate(`/projects?id=${notification.entityId}`);
        break;
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <ListChecks className="h-4 w-4" />;
      case 'note':
        return <StickyNote className="h-4 w-4" />;
      case 'project':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex cursor-pointer flex-col border-b p-3 hover:bg-muted/50",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-2 text-primary">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                  </div>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
