
// Utility functions for the application

// Create page URL
export const createPageUrl = (page: string): string => {
  const pageMap: { [key: string]: string } = {
    Tasks: "/tasks",
    Projects: "/projects",
    Notes: "/notes",
    CalendarPage: "/calendar",
    GraphViewPage: "/graph",
    AppSettings: "/settings",
    login: "/login",
    settings: "/settings"
  };

  return pageMap[page] || "/";
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

// Check if a date is today
export const isToday = (date: Date | string): boolean => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};
