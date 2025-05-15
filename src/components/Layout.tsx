
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  ListChecks, 
  StickyNote, 
  FolderKanban, 
  Settings2, 
  User, 
  CalendarDays, 
  Share2 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarInset, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import NotificationBell from "./NotificationBell";

type LayoutProps = {
  children: React.ReactNode;
  currentPageName: string;
};

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  active?: boolean;
};

const Layout = ({ children, currentPageName }: LayoutProps) => {
  const navigate = useNavigate();

  if (currentPageName === "Landing") {
    return <>{children}</>;
  }

  // Fixed user info for offline app
  const currentUser = {
    firstName: "Local",
    lastName: "User",
    email: "offline@tasksphere.app"
  };

  const navItems: NavItem[] = [
    { label: "Graph View", icon: <Share2 size={20} />, path: "/graph", active: currentPageName === "GraphViewPage" },
    { label: "Tasks", icon: <ListChecks size={20} />, path: "/tasks", active: currentPageName === "Tasks" },
    { label: "Calendar", icon: <CalendarDays size={20} />, path: "/calendar", active: currentPageName === "CalendarPage" },
    { label: "Notes", icon: <StickyNote size={20} />, path: "/notes", active: currentPageName === "Notes" },
    { label: "Projects", icon: <FolderKanban size={20} />, path: "/projects", active: currentPageName === "Projects" },
    { label: "App Settings", icon: <Settings2 size={20} />, path: "/settings", active: currentPageName === "AppSettings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const UserProfileSection = () => {
    const initials = `LU`;

    return (
      <Button
        onClick={() => navigate("/settings")}
        variant="ghost"
        className="flex h-auto w-full items-center justify-start gap-3 rounded-md p-4 hover:bg-sidebar-primary/10"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-sidebar-foreground">
            {currentUser.firstName} {currentUser.lastName}
          </p>
          <p className="text-xs text-sidebar-foreground/70">{currentUser.email}</p>
        </div>
      </Button>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between"> 
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ListChecks size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sidebar-foreground">TaskSphere</h1>
                  <p className="text-xs text-sidebar-foreground/70">Your Focus Hub</p>
                </div>
              </div>
              <NotificationBell />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={item.active}
                    tooltip={item.label}
                    size="lg"
                    className="[&>svg]:size-5 text-sidebar-foreground/80 hover:bg-sidebar-primary/10 hover:text-sidebar-primary data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-primary"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <UserProfileSection />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="h-screen overflow-x-hidden bg-background text-foreground">
          <header className="bg-card p-4 text-card-foreground md:hidden border-b border-border">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="text-foreground" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <ListChecks size={18} />
                </div>
                <h1 className="text-lg font-bold">TaskSphere</h1>
              </div>
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>

          <footer className="border-t border-border bg-card py-2 md:hidden sticky bottom-0">
            <div className="flex items-center justify-around">
              {navItems
                .filter(item => item.path !== "/settings" && item.path !== "/graph")
                .slice(0, 4)
                .concat(navItems.find(item => item.path === "/graph")!)
                .filter(Boolean)
                .map((item) => ( 
                  <Button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    variant="ghost"
                    className={`flex h-14 w-1/5 flex-col items-center justify-center gap-1 rounded-none ${
                      item.active ? "text-primary" : "text-muted-foreground"
                    } [&_svg]:size-6`} 
                  >
                    {item.icon}
                    <span className="text-[10px]">{item.label.split(" ")[0]}</span>
                  </Button>
                ))}
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
