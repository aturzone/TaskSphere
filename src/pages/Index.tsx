
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListChecks, CalendarDays, StickyNote, FolderKanban, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    { 
      title: "Task Management", 
      description: "Organize your tasks with our intuitive kanban board system",
      icon: <ListChecks className="h-10 w-10" />,
      path: "/tasks",
      color: "from-green-600 to-emerald-800"
    },
    { 
      title: "Calendar View", 
      description: "Plan your schedule with daily, monthly, and yearly calendar views",
      icon: <CalendarDays className="h-10 w-10" />,
      path: "/calendar",
      color: "from-blue-600 to-indigo-800"
    },
    { 
      title: "Notes", 
      description: "Create and organize your thoughts with rich text notes",
      icon: <StickyNote className="h-10 w-10" />,
      path: "/notes",
      color: "from-yellow-600 to-amber-800"
    },
    { 
      title: "Projects", 
      description: "Group your work into projects for better organization",
      icon: <FolderKanban className="h-10 w-10" />,
      path: "/projects",
      color: "from-purple-600 to-violet-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-6">
            TaskSphere
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8">
            Your all-in-one productivity platform for managing tasks, taking notes, 
            and organizing projects in one centralized hub
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg" 
              className="text-lg hover:text-white"
              onClick={() => navigate('/tasks')}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 border border-border"
              onMouseEnter={() => setIsHovered(feature.title)}
              onMouseLeave={() => setIsHovered(null)}
              onClick={() => navigate(feature.path)}
              style={{
                transform: isHovered === feature.title ? 'translateY(-8px)' : 'none'
              }}
            >
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 text-white bg-gradient-to-br ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70 mb-4">{feature.description}</p>
              <Button 
                variant="ghost" 
                className="text-primary hover:text-white"
                onClick={() => navigate(feature.path)}
              >
                Explore <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-secondary/50 to-secondary rounded-xl p-8 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
          <p className="text-foreground/80 mb-6">
            Start organizing your tasks, projects, and notes with TaskSphere today.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/tasks')}
            className="hover:text-white"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
