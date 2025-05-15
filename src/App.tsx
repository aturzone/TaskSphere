
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Layout from "./components/Layout";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import Notes from "./pages/Notes";
import CalendarPage from "./pages/CalendarPage";
import AppSettings from "./pages/AppSettings";
import GraphViewPage from "./pages/GraphViewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tasks" element={<Layout currentPageName="Tasks"><Tasks /></Layout>} />
          <Route path="/projects" element={<Layout currentPageName="Projects"><Projects /></Layout>} />
          <Route path="/notes" element={<Layout currentPageName="Notes"><Notes /></Layout>} />
          <Route path="/calendar" element={<Layout currentPageName="CalendarPage"><CalendarPage /></Layout>} />
          <Route path="/settings" element={<Layout currentPageName="AppSettings"><AppSettings /></Layout>} />
          <Route path="/graph" element={<Layout currentPageName="GraphViewPage"><GraphViewPage /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
