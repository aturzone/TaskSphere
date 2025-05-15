
import { useState, useEffect } from 'react';

// A simplified version of the auth hook for offline functionality
export interface User {
  id: string;
  name?: string;
  email?: string;
}

const DEFAULT_USER: User = {
  id: 'local-user',
  name: 'Local User',
};

const useAppLevelAuth = () => {
  // In offline mode, we'll always have a "current user" without actual authentication
  const [currentUser] = useState<User>(DEFAULT_USER);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Simulate a brief loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    isLoggedIn: true, // Always logged in for offline mode
    isFirstLoad,
    currentUser,
    login: () => Promise.resolve(DEFAULT_USER),
    logout: () => Promise.resolve(),
    register: () => Promise.resolve(DEFAULT_USER),
  };
};

export default useAppLevelAuth;
