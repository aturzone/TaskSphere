import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ZoomIn, ZoomOut, RotateCcw, Loader2, Network, Link, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/entities/Task';
import { Project } from '@/entities/Project';
import { ProjectStep } from '@/entities/ProjectStep';
import { Note } from '@/entities/Note';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { formatDate } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateId } from '@/utils';

// Define a GraphLink type for connections that will be stored in the database
export interface GraphConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  createdAt: string;
}

interface GraphNode {
  id: string;
  type: 'task' | 'project' | 'note' | 'step';
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  data?: any;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  strength?: number;
}

interface NetworkGraphProps {
  viewMode: 'projects' | 'steps';
  focusMode?: boolean;
}

// Helper function to safely extract node ID
const getNodeId = (node: string | GraphNode | null): string => {
  if (node === null) return '';
  if (typeof node === 'string') return node;
  return node?.id || '';
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ viewMode, focusMode = true }) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState('all');
  const [simulation, setSimulation] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [connectionTargets, setConnectionTargets] = useState<GraphNode[]>([]);
  const [selectedConnectionTargets, setSelectedConnectionTargets] = useState<string[]>([]);
  const [highlightedLinks, setHighlightedLinks] = useState<GraphLink[]>([]);
  const [persistedConnections, setPersistedConnections] = useState<GraphConnection[]>([]);
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set());
  
  const svgRef = useRef<SVGSVGElement>(null);
  const { currentUser } = useAppLevelAuth();
  const { toast } = useToast();

  const COLORS = {
    project: {
      primary: '#8b72f8', // Lighter purple
      glow: 'rgba(139, 114, 248, 0.4)'
    },
    task: {
      todo: '#f59e0b', // Amber
      inProgress: '#3b82f6', // Blue
      done: '#10b981', // Green
      glow: 'rgba(59, 130, 246, 0.3)'
    },
    note: {
      primary: '#ec4899', // Pink
      glow: 'rgba(236, 72, 153, 0.3)'
    },
    step: {
      notStarted: '#f59e0b', // Amber
      inProgress: '#3b82f6', // Blue
      done: '#10b981', // Green
      glow: 'rgba(59, 130, 246, 0.3)'
    }
  };

  // Load persisted connections from database
  useEffect(() => {
    const loadConnections = async () => {
      try {
        // Get connections from database (custom implementation)
        const connections = await getGraphConnections();
        setPersistedConnections(connections);
      } catch (error) {
        console.error("Error loading saved connections:", error);
      }
    };
    
    loadConnections();
  }, []);

  // Helper function to get graph connections from database
  const getGraphConnections = async (): Promise<GraphConnection[]> => {
    try {
      const connectionsData = localStorage.getItem('graph-connections');
      return connectionsData ? JSON.parse(connectionsData) : [];
    } catch (error) {
      console.error("Error retrieving graph connections:", error);
      return [];
    }
  };

  // Helper function to save graph connections to database
  const saveGraphConnections = async (connections: GraphConnection[]): Promise<void> => {
    try {
      localStorage.setItem('graph-connections', JSON.stringify(connections));
    } catch (error) {
      console.error("Error saving graph connections:", error);
      toast({
        title: "Error",
        description: "Could not save connections. Please try again.",
        variant: "destructive"
      });
    }
  };

  const forceSimulation = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Only run if we're in a browser environment
      const d3 = require('d3-force');
      
      // Create a new simulation
      return d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: GraphNode) => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(500, 300))
        .force('collision', d3.forceCollide().radius((d: GraphNode) => d.radius * 2))
        .on('tick', () => {
          setNodes(currentNodes => [...currentNodes]);
        });
    }
    return null;
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchGraphData();
    }

    return () => {
      // Clean up simulation when component unmounts
      if (simulation) {
        simulation.stop();
      }
    };
  }, [currentUser, viewMode]);

  useEffect(() => {
    if (nodes.length > 0 && links.length > 0) {
      if (simulation) {
        simulation.stop();
      }
      
      try {
        const newSimulation = forceSimulation();
        setSimulation(newSimulation);
      } catch (error) {
        console.error("Error creating force simulation:", error);
      }
    }
  }, [nodes.length, links.length, forceSimulation]);

  // Update connected nodes when selected node or links change
  useEffect(() => {
    if (selectedNode && focusMode) {
      const connected = new Set<string>();
      connected.add(selectedNode.id);
      
      links.forEach(link => {
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
        
        if (sourceId === selectedNode.id) {
          connected.add(targetId);
        } else if (targetId === selectedNode.id) {
          connected.add(sourceId);
        }
      });
      
      setConnectedNodeIds(connected);
    } else {
      setConnectedNodeIds(new Set());
    }
  }, [selectedNode, links, focusMode]);

  const fetchGraphData = async () => {
    setIsLoading(true);
    
    try {
      // Add d3-force as a dependency
      try {
        await import('d3-force');
      } catch (e) {
        console.error("Failed to load d3-force:", e);
      }
      
      // Fetch real data from entities
      const userProjects = await Project.getAll();
      const userTasks = await Task.getAll();
      const userNotes = await Note.getAll();
      const projectSteps = await ProjectStep.getAll();
      
      // Create nodes
      const graphNodes: GraphNode[] = [];
      const graphLinks: GraphLink[] = [];
      
      // Different graph building based on view mode
      if (viewMode === 'projects') {
        // Standard projects view
        buildProjectView(userProjects, userTasks, userNotes, graphNodes, graphLinks);
      } else {
        // Project steps detailed view
        buildStepsView(userProjects, projectSteps, graphNodes, graphLinks);
      }
      
      // Add persisted connections if available
      if (persistedConnections.length > 0) {
        persistedConnections.forEach(connection => {
          // Check if both nodes exist in the current graph
          const sourceExists = graphNodes.some(node => node.id === connection.sourceId);
          const targetExists = graphNodes.some(node => node.id === connection.targetId);
          
          if (sourceExists && targetExists) {
            // Check if this link already exists
            const linkExists = graphLinks.some(
              existingLink => 
                (getNodeId(existingLink.source) === connection.sourceId && getNodeId(existingLink.target) === connection.targetId) ||
                (getNodeId(existingLink.source) === connection.targetId && getNodeId(existingLink.target) === connection.sourceId)
            );
            
            if (!linkExists) {
              graphLinks.push({
                source: connection.sourceId,
                target: connection.targetId,
                strength: connection.strength
              });
            }
          }
        });
      }
      
      // If there's no data, display a message
      if (graphNodes.length === 0) {
        toast({
          title: "No data found",
          description: "Create some projects, tasks, or notes to visualize in the knowledge galaxy.",
          duration: 5000
        });
      }
      
      setNodes(graphNodes);
      setLinks(graphLinks);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      toast({
        title: "Error",
        description: "Could not fetch graph data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buildProjectView = (
    userProjects: Project[],
    userTasks: Task[],
    userNotes: Note[],
    graphNodes: GraphNode[],
    graphLinks: GraphLink[]
  ) => {
    // Add projects as central nodes
    userProjects.forEach((project) => {
      graphNodes.push({
        id: project.id,
        type: 'project',
        label: project.title,
        x: Math.random() * 800 + 100,
        y: Math.random() * 500 + 100,
        radius: 16, // Smaller radius
        color: project.color || COLORS.project.primary,
        data: project
      });
    });
    
    // Add tasks with connections to projects
    userTasks.forEach((task) => {
      const nodeId = task.id;
      const statusColor = task.status === 'Done' ? COLORS.task.done : 
                        task.status === 'InProgress' ? COLORS.task.inProgress : 
                        COLORS.task.todo;
      
      const priorityRadius = task.priority === 'High' ? 13 : 
                          task.priority === 'Medium' ? 10 : 8;
      
      graphNodes.push({
        id: nodeId,
        type: 'task',
        label: task.title,
        x: Math.random() * 800 + 100,
        y: Math.random() * 500 + 100,
        radius: priorityRadius,
        color: statusColor,
        data: task
      });
      
      // Link to project if exists
      if (task.projectId) {
        graphLinks.push({
          source: nodeId,
          target: task.projectId,
          strength: 0.8
        });
      }
      
      // Connect tasks with the same status (but with fewer connections)
      userTasks.forEach(otherTask => {
        if (task.id !== otherTask.id && 
            task.status === otherTask.status && 
            Math.random() > 0.7) { // Only create some connections, not all
          graphLinks.push({
            source: nodeId,
            target: otherTask.id,
            strength: 0.2
          });
        }
      });
    });
    
    // Add notes with connections
    userNotes.forEach((note) => {
      const nodeId = note.id;
      graphNodes.push({
        id: nodeId,
        type: 'note',
        label: note.title,
        x: Math.random() * 800 + 100,
        y: Math.random() * 500 + 100,
        radius: 8, // Smaller radius
        color: COLORS.note.primary,
        data: note
      });
      
      // Link to project if exists
      if (note.projectId) {
        graphLinks.push({
          source: nodeId,
          target: note.projectId,
          strength: 0.7
        });
      }
    });
  };

  const buildStepsView = (
    userProjects: Project[],
    projectSteps: ProjectStep[],
    graphNodes: GraphNode[],
    graphLinks: GraphLink[]
  ) => {
    // Map to group steps by project
    const stepsByProject: Record<string, ProjectStep[]> = {};
    
    // Group steps by project
    projectSteps.forEach(step => {
      if (!stepsByProject[step.projectId]) {
        stepsByProject[step.projectId] = [];
      }
      stepsByProject[step.projectId].push(step);
    });
    
    // Add projects as central nodes
    userProjects.forEach((project) => {
      // Skip projects without steps
      const projectHasSteps = stepsByProject[project.id] && stepsByProject[project.id].length > 0;
      
      if (projectHasSteps) {
        graphNodes.push({
          id: project.id,
          type: 'project',
          label: project.title,
          x: Math.random() * 800 + 100,
          y: Math.random() * 500 + 100,
          radius: 20, // Larger radius for projects
          color: project.color || COLORS.project.primary,
          data: project
        });
        
        // Add steps for this project
        const steps = stepsByProject[project.id];
        steps.forEach(step => {
          let statusColor;
          switch(step.status) {
            case 'Done':
              statusColor = COLORS.step.done;
              break;
            case 'InProgress':
              statusColor = COLORS.step.inProgress;
              break;
            default:
              statusColor = COLORS.step.notStarted;
          }
          
          // Calculate node size based on weight percentage
          // Scale between 6 (min) and 18 (max) radius
          const weightRadius = 6 + (step.weightPercentage / 100) * 12;
          
          graphNodes.push({
            id: step.id,
            type: 'step',
            label: `${step.title} (${step.weightPercentage}%)`,
            x: Math.random() * 800 + 100,
            y: Math.random() * 500 + 100,
            radius: weightRadius,
            color: statusColor,
            data: step
          });
          
          // Link step to its project
          graphLinks.push({
            source: step.id,
            target: project.id,
            strength: 0.9
          });
          
          // Link steps with the same status but from the same project
          steps.forEach(otherStep => {
            if (step.id !== otherStep.id && step.status === otherStep.status) {
              graphLinks.push({
                source: step.id,
                target: otherStep.id,
                strength: 0.3
              });
            }
          });
        });
      }
    });
  };

  const isNodeHighlighted = (nodeId: string): boolean => {
    if (!selectedNode || !focusMode) return true;
    return connectedNodeIds.has(nodeId);
  };

  const getNodeOpacity = (nodeId: string): number => {
    if (!selectedNode || !focusMode) return 1;
    return isNodeHighlighted(nodeId) ? 1 : 0.2;
  };

  const filteredNodes = searchQuery || filterType !== 'all'
    ? nodes.filter(node => {
        const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || node.type === filterType;
        return matchesSearch && matchesFilter;
      })
    : nodes;

  const filteredLinks = links.filter(link => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    
    return filteredNodes.some(node => node.id === sourceId) && 
           filteredNodes.some(node => node.id === targetId);
  });

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setSelectedNode(null);
    setHighlightedLinks([]);
    setConnectedNodeIds(new Set());
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
  
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
    
    // When selecting a node, highlight all its connections
    if (selectedNode?.id !== node.id) {
      highlightAllNodeConnections(node.id);
    } else {
      setHighlightedLinks([]);
    }
  };
  
  const openConnectionsDialog = (node: GraphNode) => {
    // Filter nodes that could be connection targets (exclude self)
    const targets = nodes.filter(n => n.id !== node.id);
    setConnectionTargets(targets);
    
    // Find existing connections for this node
    const nodeConnections = links.filter(link => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      return sourceId === node.id || targetId === node.id;
    });
    
    // Set initially selected targets
    const initialTargets = nodeConnections.map(link => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      return sourceId === node.id ? targetId : sourceId;
    });
    
    setSelectedConnectionTargets(initialTargets);
    setIsConnectionDialogOpen(true);
  };
  
  const handleConnectionSave = async () => {
    if (!selectedNode) return;
    
    try {
      // Get current persisted connections
      const currentConnections = await getGraphConnections();
      
      // Remove all existing connections for this node
      const updatedConnections = currentConnections.filter(conn => 
        conn.sourceId !== selectedNode.id && conn.targetId !== selectedNode.id
      );
      
      // Add new connections based on selections
      const newConnections: GraphConnection[] = selectedConnectionTargets.map(targetId => ({
        id: generateId(),
        sourceId: selectedNode.id,
        targetId: targetId,
        strength: 0.7,
        createdAt: new Date().toISOString()
      }));
      
      // Merge existing and new connections
      const finalConnections = [...updatedConnections, ...newConnections];
      
      // Save to database
      await saveGraphConnections(finalConnections);
      setPersistedConnections(finalConnections);
      
      // Update links in the graph
      const updatedLinks = links.filter(link => {
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
        return sourceId !== selectedNode.id && targetId !== selectedNode.id;
      });
      
      // Add new connections based on selections
      selectedConnectionTargets.forEach(targetId => {
        updatedLinks.push({
          source: selectedNode.id,
          target: targetId,
          strength: 0.7
        });
      });
      
      setLinks(updatedLinks);
      setIsConnectionDialogOpen(false);
      
      // Update highlighted links
      highlightAllNodeConnections(selectedNode.id);
      
      toast({
        title: "Connections updated",
        description: `Updated connections for ${selectedNode.label}`,
      });
    } catch (error) {
      console.error("Error saving connections:", error);
      toast({
        title: "Error",
        description: "Failed to save connections. Please try again.",
        variant: "destructive",
      });
    }
  };

  const highlightAllNodeConnections = (nodeId: string) => {
    const nodeLinks = links.filter(link => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      return sourceId === nodeId || targetId === nodeId;
    });
    
    setHighlightedLinks(nodeLinks);
  };
  
  const isLinkHighlighted = (link: GraphLink): boolean => {
    if (!selectedNode || highlightedLinks.length === 0) return false;
    
    return highlightedLinks.some(hl => {
      const hlSourceId = getNodeId(hl.source);
      const hlTargetId = getNodeId(hl.target);
      const linkSourceId = getNodeId(link.source);
      const linkTargetId = getNodeId(link.target);
      
      return (hlSourceId === linkSourceId && hlTargetId === linkTargetId) || 
             (hlSourceId === linkTargetId && hlTargetId === linkSourceId);
    });
  };
  
  const renderNodeDetails = () => {
    if (!selectedNode) return null;
    
    const { type, data } = selectedNode;
    
    return (
      <div className="absolute right-4 top-20 neo-blur p-5 rounded-lg shadow-glow max-w-xs">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white">
          {type === 'project' && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }}></div>}
          {selectedNode.label}
        </h3>
        
        {type === 'project' && data && (
          <>
            <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Description:</span> {data.description || 'No description'}</p>
            {data.startDate && <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Start:</span> {formatDate(data.startDate)}</p>}
            {data.endDate && <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">End:</span> {formatDate(data.endDate)}</p>}
          </>
        )}
        
        {type === 'task' && data && (
          <>
            <div className="flex items-center gap-1 mb-1">
              <span className="font-medium text-sm text-white">Status:</span> 
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                data.status === 'Done' ? 'bg-green-500/20 text-green-300' : 
                data.status === 'InProgress' ? 'bg-blue-500/20 text-blue-300' : 
                'bg-amber-500/20 text-amber-300'
              }`}>
                {data.status}
              </span>
            </div>
            <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Priority:</span> {data.priority || 'None'}</p>
            {data.description && <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Description:</span> {data.description}</p>}
            {data.dueDate && <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Due:</span> {formatDate(data.dueDate)}</p>}
          </>
        )}
        
        {type === 'note' && data && (
          <>
            <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Created:</span> {formatDate(data.createdAt)}</p>
            <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Content preview:</span></p>
            <p className="text-xs line-clamp-3 italic text-white/70">{data.content || 'No content'}</p>
          </>
        )}
        
        {type === 'step' && data && (
          <>
            <div className="flex items-center gap-1 mb-1">
              <span className="font-medium text-sm text-white">Status:</span> 
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                data.status === 'Done' ? 'bg-green-500/20 text-green-300' : 
                data.status === 'InProgress' ? 'bg-blue-500/20 text-blue-300' : 
                'bg-amber-500/20 text-amber-300'
              }`}>
                {data.status}
              </span>
            </div>
            <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Weight:</span> {data.weightPercentage}%</p>
            {data.description && <p className="text-sm mb-1 text-white/80"><span className="font-medium text-white">Description:</span> {data.description}</p>}
          </>
        )}
        
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="w-full glow-button" onClick={() => openConnectionsDialog(selectedNode)}>
            <Link className="h-4 w-4 mr-1" />
            Manage Connections
          </Button>
          <Button variant="outline" size="sm" className="glow-button" onClick={() => {
            setSelectedNode(null);
            setHighlightedLinks([]);
          }}>
            Close
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between p-4 neo-blur rounded-lg mb-4 shadow-glow">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search galaxy..."
              className="pl-8 w-[200px] md:w-[200px] bg-transparent border-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] bg-transparent border-white/20">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              {viewMode === 'projects' ? (
                <>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                </>
              ) : (
                <SelectItem value="step">Steps</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="cosmic-button" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="cosmic-button" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="cosmic-button" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="cosmic-button" onClick={fetchGraphData}>
            <Network className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow relative galaxy-background">
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-move"
        >
          {/* Star field background */}
          {Array.from({ length: 150 }).map((_, i) => (
            <circle
              key={`star-${i}`}
              cx={Math.random() * 100 + "%"}
              cy={Math.random() * 100 + "%"}
              r={Math.random() * 1.2}
              fill="white"
              opacity={Math.random() * 0.7 + 0.1}
              className={`animate-pulse star-twinkle-${i % 5}`}
            />
          ))}
          
          <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
            {/* Draw links first so they're under the nodes */}
            {filteredLinks.map((link, index) => {
              const sourceId = getNodeId(link.source);
              const targetId = getNodeId(link.target);
              
              const sourceNode = filteredNodes.find(node => node.id === sourceId);
              const targetNode = filteredNodes.find(node => node.id === targetId);
              
              if (!sourceNode || !targetNode) return null;
              
              // Both connected nodes need to be visible
              if (selectedNode && focusMode && 
                 (!isNodeHighlighted(sourceId) || !isNodeHighlighted(targetId))) {
                return null; // Don't render links to dimmed nodes
              }
              
              const sourceType = sourceNode.type;
              const targetType = targetNode.type;
              
              // Determine stroke style based on connection type
              let strokeStyle = "rgba(180, 180, 180, 0.08)";
              let strokeWidth = 0.8;
              let dashArray = "";
              
              // Check if this link should be highlighted
              const isHighlighted = isLinkHighlighted(link);
              
              if (isHighlighted) {
                if (sourceType === 'project' || targetType === 'project') {
                  strokeStyle = "rgba(139, 114, 248, 0.9)"; // Purple for project connections
                } else if (sourceType === 'step' || targetType === 'step') {
                  strokeStyle = "rgba(59, 130, 246, 0.9)"; // Blue for step connections
                } else if (sourceType === 'task' || targetType === 'task') {
                  strokeStyle = "rgba(59, 130, 246, 0.9)"; // Blue for task connections
                } else {
                  strokeStyle = "rgba(236, 72, 153, 0.9)"; // Pink for note connections
                }
                strokeWidth = 1.5;
              } else {
                if ((sourceType === 'task' || sourceType === 'step') && targetType === 'project') {
                  strokeStyle = "rgba(79, 70, 229, 0.2)";
                } else if (sourceType === 'note' && targetType === 'project') {
                  strokeStyle = "rgba(236, 72, 153, 0.2)";
                  dashArray = "3,3";
                } else if (sourceType === 'task' && targetType === 'task') {
                  strokeStyle = "rgba(79, 70, 229, 0.1)";
                  dashArray = "1,2";
                } else if (sourceType === 'step' && targetType === 'step') {
                  strokeStyle = "rgba(79, 70, 229, 0.1)";
                  dashArray = "1,2";
                }
              }
              
              return (
                <line 
                  key={`link-${index}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeStyle}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  className={isHighlighted ? "connection-highlight" : ""}
                />
              );
            })}
            
            {/* Draw nodes on top of links */}
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const nodeOpacity = getNodeOpacity(node.id);
              const glowRadius = isSelected ? node.radius * 2.2 : node.radius * 1.5;
              const glowColor = isSelected 
                ? node.type === 'project' 
                  ? COLORS.project.glow 
                  : node.type === 'task' 
                    ? COLORS.task.glow 
                    : node.type === 'step'
                      ? COLORS.step.glow
                      : COLORS.note.glow
                : `rgba(${parseInt(node.color.slice(1, 3), 16)}, ${parseInt(node.color.slice(3, 5), 16)}, ${parseInt(node.color.slice(5, 7), 16)}, 0.2)`;
              
              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  style={{ opacity: nodeOpacity }}
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Glow effect */}
                  <circle 
                    r={glowRadius} 
                    fill={glowColor}
                    className={`cosmic-glow ${isSelected ? 'animate-pulse' : ''}`}
                    style={{ filter: 'blur(6px)' }}
                  />
                  
                  {/* Core star effect */}
                  <circle 
                    r={node.radius * 0.6} 
                    fill={node.color}
                    className="transition-all duration-300 star-core"
                    style={{ filter: 'brightness(1.2)' }}
                  />
                  
                  {/* Central bright part - always white */}
                  <circle 
                    r={node.radius * 0.4} 
                    fill="white"
                    opacity={0.9}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </g>
        </svg>
        
        {renderNodeDetails()}
      </div>
      
      {/* Connection Management Dialog */}
      <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Connections</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select nodes to connect with {selectedNode?.label}
            </p>
            
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {connectionTargets.map((target) => (
                  <div key={target.id} className="flex items-center gap-2 p-2 hover:bg-muted/30 rounded-md">
                    <Checkbox 
                      id={`target-${target.id}`}
                      checked={selectedConnectionTargets.includes(target.id)}
                      onCheckedChange={() => {
                        if (selectedConnectionTargets.includes(target.id)) {
                          setSelectedConnectionTargets(prev => 
                            prev.filter(id => id !== target.id)
                          );
                        } else {
                          setSelectedConnectionTargets(prev => [...prev, target.id]);
                        }
                      }}
                    />
                    <Label htmlFor={`target-${target.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: target.color }}></div>
                      <span>{target.label}</span>
                      <span className="text-xs text-muted-foreground capitalize">({target.type})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectionSave}>
              Save Connections
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkGraph;
