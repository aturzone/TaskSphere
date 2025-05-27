
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "@/services/authService";
import LoadingScreen from "@/components/LoadingScreen";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Tasks from "@/pages/Tasks";
import Notes from "@/pages/Notes";
import Projects from "@/pages/Projects";
import CalendarPage from "@/pages/CalendarPage";
import GraphViewPage from "@/pages/GraphViewPage";
import AppSettings from "@/pages/AppSettings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Show loading screen for a bit
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      // Check authentication status
      try {
        if (authService.isLoggedIn()) {
          await authService.validateToken();
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }

      return () => clearTimeout(timer);
    };

    initializeApp();
  }, []);

  if (isLoading || isCheckingAuth) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout currentPageName="Index">
                  <Index />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Layout currentPageName="Tasks">
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/notes" element={
              <ProtectedRoute>
                <Layout currentPageName="Notes">
                  <Notes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Layout currentPageName="Projects">
                  <Projects />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Layout currentPageName="CalendarPage">
                  <CalendarPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/graph" element={
              <ProtectedRoute>
                <Layout currentPageName="GraphViewPage">
                  <GraphViewPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout currentPageName="AppSettings">
                  <AppSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
