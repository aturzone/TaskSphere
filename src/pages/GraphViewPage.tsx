
import React, { useState } from 'react';
import NetworkGraph from '@/components/NetworkGraph';
import { Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const GraphViewPage = () => {
  const [viewMode, setViewMode] = useState<'projects' | 'steps'>('projects');
  const [focusMode, setFocusMode] = useState<boolean>(true);
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 h-[calc(100vh-10rem)]">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold flex items-center text-gradient-cosmic">
          <Network className="mr-3 h-8 w-8 text-primary" />
          Knowledge Galaxy
        </h1>
        
        <div className="flex items-center space-x-4">
          <Select 
            value={viewMode} 
            onValueChange={(value: 'projects' | 'steps') => setViewMode(value)}
          >
            <SelectTrigger className="w-[180px] neo-blur text-white">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="projects">Projects Overview</SelectItem>
              <SelectItem value="steps">Project Steps View</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="neo-blur text-white hover:text-primary"
            onClick={() => window.history.back()}
          >
            Back to Projects
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden h-[calc(100vh-12rem)] bg-black/90 relative galaxy-container">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-background/5 to-background"></div>
        <NetworkGraph viewMode={viewMode} focusMode={focusMode} />
      </div>
      
      <div className="flex justify-center p-2 gap-4 flex-wrap">
        <div className="legend-item flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#8b72f8]" style={{ boxShadow: '0 0 8px rgba(139, 114, 248, 0.6)' }}></div>
          <span className="text-primary-foreground">Projects</span>
        </div>
        <div className="legend-item flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }}></div>
          <span className="text-primary-foreground">In Progress</span>
        </div>
        <div className="legend-item flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></div>
          <span className="text-primary-foreground">Done</span>
        </div>
        <div className="legend-item flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" style={{ boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)' }}></div>
          <span className="text-primary-foreground">To Do</span>
        </div>
        <div className="legend-item flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-pink-500" style={{ boxShadow: '0 0 8px rgba(236, 72, 153, 0.6)' }}></div>
          <span className="text-primary-foreground">Notes</span>
        </div>
      </div>
    </div>
  );
};

export default GraphViewPage;
