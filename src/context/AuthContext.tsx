
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean; // Changed username to email
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'stepwise_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until checked
  const router = useRouter();

  useEffect(() => {
    // Check localStorage only on the client side after mount
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Handle potential errors (e.g., private browsing, storage disabled)
    } finally {
      setIsLoading(false); // Finished checking auth status
    }
  }, []);

  const login = (email: string, pass: string): boolean => { // Changed username to email
    // Hardcoded credentials - Use email for check
    // NOTE: For a real application, replace 'admin@stepwise.app' with the actual Admin email
    // or implement proper database authentication.
    if ((email.toLowerCase() === 'admin' || email.toLowerCase() === 'admin@stepwise.app') && pass === '1234') {
      try {
        localStorage.setItem(AUTH_KEY, 'true');
      } catch (error) {
        console.error('Error setting localStorage:', error);
        // Optionally notify the user or handle the error
      }
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error removing localStorage:', error);
    }
    setIsAuthenticated(false);
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

