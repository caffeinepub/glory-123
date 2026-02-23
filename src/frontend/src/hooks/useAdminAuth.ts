import { useState, useEffect } from 'react';

const ADMIN_SESSION_KEY = 'admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
