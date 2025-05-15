import React, { useState, useEffect, useRef } from 'react';
import { Search, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/entities/Task';
import { Project } from '@/entities/Project';
import { Note } from '@/entities/Note';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';

interface GraphNode {
  id: string;
  type: 'task' | 'project' | 'note';
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
}

const NetworkGraph: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const { currentUser } = useAppLevelAuth();

  useEffect(() => {
    if (currentUser) {
      fetchGraphData();
    }
  }, [currentUser]);

  const fetchGraphData = async () => {
    setIsLoading(true);
    
    try {
      const projects = await Project.filter({ userId: currentUser?.id });
      const tasks = await Task.filter({ userId: currentUser?.id });
      const notes = await Note.filter({ userId: currentUser?.id });

      // Create nodes
      const graphNodes: GraphNode[] = [];
      const graphLinks: GraphLink[] = [];
      
      // Add projects as central nodes
      projects.forEach((project, index) => {
        const angle = (2 * Math.PI * index) / projects.length;
        const radius = 150;
        
        graphNodes.push({
          id: project.id,
          type: 'project',
          label: project.title,
          x: Math.cos(angle) * radius + 500,
          y: Math.sin(angle) * radius + 300,
          radius: 20,
          color: project.color,
        });
      });
      
      // Add tasks with connections to projects
      tasks.forEach((task, index) => {
        const angle = (2 * Math.PI * index) / tasks.length;
        const radius = 250;
        
        const nodeId = `task-${task.id}`;
        graphNodes.push({
          id: nodeId,
          type: 'task',
          label: task.title,
          x: Math.cos(angle) * radius + 500,
          y: Math.sin(angle) * radius + 300,
          radius: 10,
          color: task.status === 'Done' ? '#10B981' : task.status === 'InProgress' ? '#3B82F6' : '#F59E0B',
        });
        
        // Link to project if exists
        if (task.projectId) {
          graphLinks.push({
            source: nodeId,
            target: task.projectId,
          });
        }
      });
      
      // Add notes with connections
      notes.forEach((note, index) => {
        const angle = (2 * Math.PI * index) / notes.length;
        const radius = 350;
        
        const nodeId = `note-${note.id}`;
        graphNodes.push({
          id: nodeId,
          type: 'note',
          label: note.title,
          x: Math.cos(angle) * radius + 500,
          y: Math.sin(angle) * radius + 300,
          radius: 8,
          color: '#EC4899',
        });
        
        // Link to project if exists
        if (note.projectId) {
          graphLinks.push({
            source: nodeId,
            target: note.projectId,
          });
        }
      });
      
      setNodes(graphNodes);
      setLinks(graphLinks);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNodes = searchQuery 
    ? nodes.filter(node => 
        node.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nodes;

  const filteredLinks = searchQuery
    ? links.filter(link => 
        filteredNodes.some(node => node.id === link.source) && 
        filteredNodes.some(node => node.id === link.target)
      )
    : links;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            className="pl-8 w-[200px] md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-grow">
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
            {/* Draw links first so they're under the nodes */}
            {filteredLinks.map((link, index) => {
              const sourceNode = filteredNodes.find(node => node.id === link.source);
              const targetNode = filteredNodes.find(node => node.id === link.target);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <line 
                  key={`link-${index}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  className="stroke-muted-foreground/40"
                  strokeWidth={1}
                />
              );
            })}
            
            {/* Draw nodes on top of links */}
            {filteredNodes.map(node => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle 
                  r={node.radius} 
                  fill={node.color}
                  className="filter drop-shadow-md"
                />
                <text 
                  dy=".3em" 
                  textAnchor="middle" 
                  fontSize={node.type === 'project' ? "10px" : "8px"}
                  className="fill-foreground font-medium pointer-events-none"
                >
                  {node.label.length > 12 ? `${node.label.substring(0, 10)}...` : node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <div className="flex justify-center p-2 gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs">Projects</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs">Tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span className="text-xs">Notes</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
