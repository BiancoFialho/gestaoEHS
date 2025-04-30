
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>; // Changed to identifier, made async
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'ehs_control_auth'; // Changed key slightly for clarity

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

 const login = async (identifier: string, pass: string): Promise<boolean> => { // Changed username to identifier, made async
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerIdentifier = identifier.toLowerCase();
    // Hardcoded credentials - Check against email 'biancofialho@gmail.com'
    if (lowerIdentifier === 'biancofialho@gmail.com' && pass === '1234') {
      try {
        localStorage.setItem(AUTH_KEY, 'true');
      } catch (error) {
        console.error('Error setting localStorage:', error);
        // Optionally notify the user or handle the error
        // Consider returning false if storing auth state fails criticaly
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

    