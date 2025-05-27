
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    if (!authService.isLoggedIn()) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const isValid = await authService.validateToken();
      setIsAuthenticated(isValid);
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
