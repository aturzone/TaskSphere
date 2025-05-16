import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, StickyNote, ListChecks, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import useAppLevelAuth from '@/hooks/useAppLevelAuth';

import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format,
  isSameMonth,
  isSameDay,
  isSameYear,
  parseISO,
  addDays,
  subDays,
  isValid,
  setMonth,
} from 'date-fns';

import { Task } from '@/entities/Task';
import { Note } from '@/entities/Note';
import TaskFormDialog from '@/components/TaskFormDialog';
import NoteFormDialog from '@/components/NoteFormDialog';

interface CalendarItem {
  id: string;
  date: Date;
  title: string;
  type: 'task' | 'note';
  originalItem: any;
  icon?: React.ReactNode;
  color?: string;
  startTime?: string;
  endTime?: string;
}

const CalendarPage: React.FC = () => {
  const [currentDateFocus, setCurrentDateFocus] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day' | 'year'>('month');
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDayItemsDialog, setSelectedDayItemsDialog] = useState<CalendarItem[]>([]);
  const [showDayDetailsDialog, setShowDayDetailsDialog] = useState(false);
  const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | null>(null);

  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const { toast } = useToast();
  const { currentUser } = useAppLevelAuth();

  useEffect(() => {
    if (currentUser) {
      fetchCalendarData();
    }
  }, [currentUser, currentDateFocus, viewMode]);

  const fetchCalendarData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      let startDateRange, endDateRange;
      if (viewMode === 'year') {
        startDateRange = startOfYear(currentDateFocus);
        endDateRange = endOfYear(currentDateFocus);
      } else if (viewMode === 'month') {
        startDateRange = startOfWeek(startOfMonth(currentDateFocus), { weekStartsOn: 1 });
        endDateRange = endOfWeek(endOfMonth(currentDateFocus), { weekStartsOn: 1 });
      } else { // day view
        startDateRange = startOfDay(currentDateFocus);
        endDateRange = endOfDay(currentDateFocus);
      }

      // Fetch all tasks and notes for the current user
      const tasks = await Task.filter({ userId: currentUser.id });
      const notes = await Note.filter({ userId: currentUser.id });

      const items: CalendarItem[] = [];
      tasks.forEach(task => {
        if (task.dueDate && isValid(parseISO(task.dueDate))) {
          items.push({
            id: task.id,
            date: parseISO(task.dueDate),
            title: task.title,
            type: 'task',
            originalItem: task,
            icon: <ListChecks className="h-4 w-4 mr-1 flex-shrink-0" />,
            color: task.status === 'Done' ? 'text-green-500' : 'text-blue-500',
            startTime: task.startTime,
            endTime: task.endTime,
          });
        }
      });
      notes.forEach(note => {
        if (isValid(parseISO(note.createdAt))) {
          items.push({
            id: note.id,
            date: parseISO(note.createdAt),
            title: note.title,
            type: 'note',
            originalItem: note,
            icon: <StickyNote className="h-4 w-4 mr-1 flex-shrink-0" />,
            color: 'text-yellow-600',
          });
        }
      });
      setCalendarItems(items);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
      toast({ title: "Error", description: "Could not load calendar data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

  const daysInMonthGrid = useMemo(() => {
    if (viewMode !== 'month') return [];
    const monthStart = startOfMonth(currentDateFocus);
    const monthEnd = endOfMonth(currentDateFocus);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDateFocus, viewMode]);

  const itemsForSelectedDayView = useMemo(() => {
    if (viewMode !== 'day') return [];
    return calendarItems
      .filter(item => isSameDay(item.date, currentDateFocus))
      .sort((a, b) => {
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        if (a.startTime) return -1;
        if (b.startTime) return 1;
        if (a.type === 'task' && b.type === 'note') return -1;
        if (a.type === 'note' && b.type === 'task') return 1;
        return 0;
      });
  }, [calendarItems, currentDateFocus, viewMode]);

  const tasksByDayForYearView = useMemo(() => {
    if (viewMode !== 'year') return {};
    const tasksMap: Record<string, number> = {};
    calendarItems.filter(item => item.type === 'task' && isSameYear(item.date, currentDateFocus))
      .forEach(task => {
        const dayKey = format(task.date, 'yyyy-MM-dd');
        tasksMap[dayKey] = (tasksMap[dayKey] || 0) + 1;
      });
    return tasksMap;
  }, [calendarItems, currentDateFocus, viewMode]);

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDateFocus(subMonths(currentDateFocus, 1));
    else if (viewMode === 'day') setCurrentDateFocus(subDays(currentDateFocus, 1));
    else if (viewMode === 'year') setCurrentDateFocus(subYears(currentDateFocus, 1));
  };
  const handleNext = () => {
    if (viewMode === 'month') setCurrentDateFocus(addMonths(currentDateFocus, 1));
    else if (viewMode === 'day') setCurrentDateFocus(addDays(currentDateFocus, 1));
    else if (viewMode === 'year') setCurrentDateFocus(addYears(currentDateFocus, 1));
  };
  const handleToday = () => {
    setCurrentDateFocus(new Date());
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDateFocus(date);
      if (viewMode === 'year') setViewMode('month');
    }
  };

  const handleDayGridClick = (day: Date) => {
    setCurrentDateFocus(day);
    setViewMode('day');
  };

  const handleViewModeChange = (newMode: 'month' | 'day' | 'year') => {
    setViewMode(newMode);
  };

  const handleItemClick = (item: CalendarItem) => {
    setShowDayDetailsDialog(false);
    if (item.type === 'task') {
      setEditingTask(item.originalItem);
      setShowTaskForm(true);
    } else if (item.type === 'note') {
      setEditingNote(item.originalItem);
      setShowNoteForm(true);
    }
  };

  const onFormSave = () => {
    fetchCalendarData();
    setShowTaskForm(false);
    setEditingTask(null);
    setShowNoteForm(false);
    setEditingNote(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthsOfYear = Array.from({ length: 12 }, (_, i) => format(new Date(currentDateFocus.getFullYear(), i, 1), 'MMMM'));

  // Modify the GitHub-style task density color function
  const getTaskDensityColor = (count: number): string => {
    if (count === 0) return 'bg-muted/20 hover:bg-muted/40';
    if (count === 1) return 'bg-[#0e4429] hover:bg-[#196c39] dark:bg-[#006d32] dark:hover:bg-[#26a641]';
    if (count <= 3) return 'bg-[#006d32] hover:bg-[#26a641] dark:bg-[#26a641] dark:hover:bg-[#39d353]';
    if (count <= 5) return 'bg-[#26a641] hover:bg-[#39d353] dark:bg-[#39d353] dark:hover:bg-[#4ffc6a]';
    return 'bg-[#39d353] hover:bg-[#4ffc6a] dark:bg-[#4ffc6a] dark:hover:bg-[#73fe87]';
  };

  const renderYearView = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{format(currentDateFocus, 'yyyy')}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthsOfYear.map((monthName, monthIndex) => {
            const monthDate = setMonth(startOfYear(currentDateFocus), monthIndex);
            const daysInThisMonth = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) });
            const firstDayOfMonth = startOfMonth(monthDate);
            let dayOfWeek = firstDayOfMonth.getDay();
            let gridOffset = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
            
            return (
              <div key={monthName} className="p-2 rounded-md border">
                <h4 className="text-sm font-semibold text-center mb-2">{monthName}</h4>
                <div className="grid grid-cols-7 gap-px text-center">
                  {weekDays.map(wd => (
                    <div key={`${monthName}-${wd}`} className="text-muted-foreground text-[10px] pb-1">
                      {wd.substring(0,1)}
                    </div>
                  ))}
                  {Array(gridOffset).fill(null).map((_, i) => (
                    <div key={`offset-${monthIndex}-${i}`} className="h-4"></div>
                  ))}
                  {daysInThisMonth.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const taskCount = tasksByDayForYearView[dayKey] || 0;
                    return (
                      <div
                        key={dayKey}
                        title={`${format(day, 'MMM d')}: ${taskCount} task(s)`}
                        className={`h-4 w-4 mx-auto rounded-sm cursor-pointer transition-all ${getTaskDensityColor(taskCount)}`}
                        onClick={() => handleDayGridClick(day)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderMonthView = () => (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => <div key={day} className="p-3 text-center font-medium text-sm text-muted-foreground border-r last:border-r-0">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {daysInMonthGrid.map((day, index) => {
            const itemsForDay = calendarItems.filter(item => isSameDay(item.date, day));
            return (
              <div
                key={index}
                className={`p-2 border-r border-b min-h-[100px] sm:min-h-[120px] flex flex-col ${!isSameMonth(day, currentDateFocus) ? 'bg-muted/30' : 'bg-card'} ${isSameDay(day, new Date()) ? 'bg-primary/10' : ''} transition-colors hover:bg-muted/50 cursor-pointer`}
                onClick={() => handleDayGridClick(day)}
              >
                <span className={`font-medium text-sm ${!isSameMonth(day, currentDateFocus) ? 'text-muted-foreground/50' : 'text-foreground'}`}>{format(day, 'd')}</span>
                <ScrollArea className="flex-grow h-[60px] sm:h-[80px] mt-1 pr-1">
                  <div className="space-y-1">
                    {itemsForDay.slice(0, 2).map(item => (
                      <div key={item.id} className={`text-xs p-1 rounded-sm truncate flex items-center ${item.color || 'text-foreground'} ${item.type === 'task' ? 'bg-blue-500/10 dark:bg-blue-900/30' : 'bg-yellow-500/10 dark:bg-yellow-900/30'}`} title={item.title}>
                        {item.icon && React.cloneElement(item.icon as React.ReactElement, { className: "h-3 w-3 mr-1 flex-shrink-0" })}
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                    {itemsForDay.length > 2 && <div className="text-xs text-muted-foreground p-1">+ {itemsForDay.length - 2} more</div>}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderDayView = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{format(currentDateFocus, 'EEEE, MMMM d, yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /> :
          itemsForSelectedDayView.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No items scheduled for this day.</p>
          ) : (
            <ScrollArea className="max-h-[calc(100vh-350px)]">
              <div className="space-y-3">
                {itemsForSelectedDayView.map(item => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md" onClick={() => handleItemClick(item)}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`mr-2 ${item.color}`}>{item.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                        </div>
                      </div>
                      {item.startTime && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.startTime} {item.endTime && `- ${item.endTime}`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )
        }
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous period"><ChevronLeft className="h-5 w-5" /></Button>
          <Button variant="outline" onClick={handleToday} className="px-3 sm:px-4">Today</Button>
          <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next period"><ChevronRight className="h-5 w-5" /></Button>
          <h2 className="text-lg sm:text-xl font-semibold w-auto text-center ml-1 sm:ml-2">
            {viewMode === 'month' && format(currentDateFocus, 'MMMM yyyy')}
            {viewMode === 'day' && format(currentDateFocus, 'MMMM d, yyyy')}
            {viewMode === 'year' && format(currentDateFocus, 'yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                <Search className="mr-2 h-4 w-4" />
                Go to Date...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDateFocus}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Tabs value={viewMode} onValueChange={(value) => handleViewModeChange(value as 'month' | 'day' | 'year')}>
            <TabsList>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {viewMode === 'year' && renderYearView()}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'day' && renderDayView()}
      
      <Dialog open={showDayDetailsDialog} onOpenChange={setShowDayDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDateForDialog ? format(selectedDateForDialog, 'EEEE, MMMM d, yyyy') : 'Details'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            {selectedDayItemsDialog.length > 0 ? (
              <div className="space-y-3">
                {selectedDayItemsDialog.map(item => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md" onClick={() => handleItemClick(item)}>
                    <CardContent className="p-3">
                      <div className="flex items-center">
                        <span className={`mr-2 ${item.color}`}>{item.icon || (item.type === 'task' ? <ListChecks className="h-4 w-4" /> : <StickyNote className="h-4 w-4" />)}</span>
                        <div className="flex-grow">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                        </div>
                        {item.startTime && (
                          <div className="text-xs text-muted-foreground flex items-center ml-auto">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.startTime} {item.endTime && `- ${item.endTime}`}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground text-center py-4">No items for this day.</p>}
          </ScrollArea>
          <DialogFooter className="mt-4"><Button variant="outline" onClick={() => setShowDayDetailsDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskFormDialog isOpen={showTaskForm} onOpenChange={setShowTaskForm} task={editingTask} onSave={onFormSave} />
      <NoteFormDialog isOpen={showNoteForm} onOpenChange={setShowNoteForm} note={editingNote} onSave={onFormSave} />
    </div>
  );
};

export default CalendarPage;
