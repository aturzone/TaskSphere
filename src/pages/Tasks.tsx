import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '@/entities/Task';
import { Project } from '@/entities/Project';
import TaskItem from '@/components/TaskItem';
import TaskFormDialog from '@/components/TaskFormDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, Loader2, Filter, ArrowDownUp, Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [filterStatus, setFilterStatus] = useState('all');

  const { toast } = useToast();
  const { isFirstLoad, currentUser, isLoggedIn } = useAppLevelAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('projectId');

  useEffect(() => {
    if (currentUser) {
      fetchTasksAndProject();
    }
  }, [currentUser, projectId]);

  const fetchTasksAndProject = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      let taskList;
      if (projectId) {
        taskList = await Task.filter({ projectId, userId: currentUser.id }, sortBy as any);
        const projectData = await Project.get(projectId);
        setCurrentProject(projectData);
      } else {
        taskList = await Task.filter({ userId: currentUser.id }, sortBy as any);
        setCurrentProject(null);
      }
      setTasks(taskList);
    } catch (error) {
      console.error("Failed to fetch tasks or project:", error);
      toast({ title: "Error", description: "Could not load tasks or project details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newStatus = completed ? 'Done' : 'Todo';
        await Task.update(taskId, { status: newStatus });
        toast({ title: "Task Updated", description: `Task marked as ${newStatus.toLowerCase()}.` });
        fetchTasksAndProject(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast({ title: "Error", description: "Could not update task status.", variant: "destructive" });
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTaskAttempt = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await Task.delete(taskToDelete);
      toast({ title: "Task Deleted", description: "The task has been successfully deleted." });
      fetchTasksAndProject(); // Refresh list
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({ title: "Error", description: "Could not delete the task.", variant: "destructive" });
    } finally {
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const openNewTaskForm = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(task => 
        filterStatus === 'all' ? true : task.status === filterStatus
      );
  }, [tasks, searchTerm, filterStatus]);

  const taskGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      'High': [],
      'Medium': [],
      'Low': [],
      'No Priority': [],
      'Done': []
    };
    filteredTasks.forEach(task => {
      if (task.status === 'Done') {
        groups['Done'].push(task);
      } else if (task.priority) {
        groups[task.priority].push(task);
      } else {
        groups['No Priority'].push(task);
      }
    });
    return groups;
  }, [filteredTasks]);

  if (isFirstLoad) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isLoggedIn && !isFirstLoad) {
     return (
      <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)] text-center">
        <ListChecks size={64} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Please log in to manage your tasks.</p>
        <Button onClick={() => navigate(createPageUrl('login'))}>Login</Button>
      </div>
    );
  }

  const renderTaskSection = (title: string, tasksForSection: any[]) => {
    if (tasksForSection.length === 0) return null;
    return (
      <div key={title} className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-muted-foreground">{title} ({tasksForSection.length})</h2>
        <div className="space-y-3">
          {tasksForSection.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTaskAttempt}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          {currentProject ? (
            <>
              <div 
                className="h-8 w-8 rounded-md mr-3" 
                style={{ backgroundColor: currentProject.color || '#3B82F6' }}
              ></div>
              <h1 className="text-3xl font-bold">
                {currentProject.title} Tasks
              </h1>
            </>
          ) : (
            <h1 className="text-3xl font-bold flex items-center">
              <ListChecks className="mr-3 h-8 w-8 text-primary" />
              All Tasks
            </h1>
          )}
        </div>
        <Button onClick={openNewTaskForm}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add Task
        </Button>
      </div>

      <div className="mb-6 p-4 bg-card rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-input border-border"
              />
            </div>
          </div>
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-input border-border">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Todo">To Do</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); fetchTasksAndProject(); }}>
              <SelectTrigger className="bg-input border-border">
                <ArrowDownUp className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:desc">Created: Newest</SelectItem>
                <SelectItem value="createdAt:asc">Created: Oldest</SelectItem>
                <SelectItem value="dueDate:asc">Due Date: Soonest</SelectItem>
                <SelectItem value="dueDate:desc">Due Date: Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {filteredTasks.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <ListChecks size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            {tasks.length === 0 ? 'No tasks yet!' : 'No tasks match your filters.'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {tasks.length === 0 ? 'Get started by adding your first task.' : 'Try adjusting your search or filters.'}
          </p>
          {tasks.length === 0 && <Button onClick={openNewTaskForm}><PlusCircle className="mr-2 h-5 w-5" /> Add Task</Button>}
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Tasks</TabsTrigger>
            <TabsTrigger value="done">Completed Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {renderTaskSection('High', taskGroups['High'])}
            {renderTaskSection('Medium', taskGroups['Medium'])}
            {renderTaskSection('Low', taskGroups['Low'])}
            {renderTaskSection('No Priority', taskGroups['No Priority'])}
            {(taskGroups['High'].length + taskGroups['Medium'].length + taskGroups['Low'].length + taskGroups['No Priority'].length === 0) && (
                 <p className="text-muted-foreground text-center py-8">No active tasks match your filters.</p>
            )}
          </TabsContent>
          <TabsContent value="done">
            {renderTaskSection('Done', taskGroups['Done'])}
            {taskGroups['Done'].length === 0 && (
                 <p className="text-muted-foreground text-center py-8">No completed tasks match your filters.</p>
            )}
          </TabsContent>
        </Tabs>
      )}

      <TaskFormDialog
        isOpen={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={editingTask}
        onSave={() => {
          fetchTasksAndProject();
          setShowTaskForm(false);
          setEditingTask(null);
        }}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksPage;
