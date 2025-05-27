
import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  name?: string;
  email?: string;
}

const useAppLevelAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authService.isLoggedIn()) {
        const isValid = await authService.validateToken();
        if (isValid) {
          const username = authService.getUsername();
          setCurrentUser({
            id: 'authenticated-user',
            name: username || 'User',
          });
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setIsFirstLoad(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const result = await authService.login(username, password);
      if (result.success) {
        setCurrentUser({
          id: 'authenticated-user',
          name: result.username || 'User',
        });
        setIsLoggedIn(true);
        return { id: 'authenticated-user', name: result.username || 'User' };
      }
      throw new Error(result.error || 'Login failed');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const result = await authService.setupFirstUser(username, password);
      if (result.success) {
        // Auto login after setup
        return await login(username, password);
      }
      throw new Error(result.error || 'Registration failed');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  return {
    isLoggedIn,
    isFirstLoad,
    currentUser,
    login,
    logout,
    register,
  };
};

export default useAppLevelAuth;
