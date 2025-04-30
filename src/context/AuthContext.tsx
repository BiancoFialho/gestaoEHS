
"use client";

import type { ReactNode } from 'react';
import React, { createContext } from 'react'; // Removed useState, useEffect
// import { useRouter } from 'next/navigation'; // Keep if needed for logout redirect

interface AuthContextType {
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const AUTH_KEY = 'ehs_control_auth'; // Key not needed for now

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  // const router = useRouter();

  // useEffect(() => {
  //   // No need to check localStorage for now
  //   setIsLoading(false);
  // }, []);

 const login = async (identifier: string, pass: string): Promise<boolean> => {
    // Simulate API call delay (optional)
    // await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Login attempt with identifier: ${identifier}`); // Log attempt
    // Always return true for now
    return true;
  };


  const logout = () => {
    // try {
    //   localStorage.removeItem(AUTH_KEY);
    // } catch (error) {
    //   console.error('Error removing localStorage:', error);
    // }
    // setIsAuthenticated(false);
    console.log("Logout triggered"); // Simulate logout
    // Redirect can be handled by middleware or page logic if needed later
    // router.push('/login');
  };

  // Always authenticated, never loading
  const value = {
    isAuthenticated: true,
    login,
    logout,
    isLoading: false,
  };

  return (
    <AuthContext.Provider value={value}>
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
