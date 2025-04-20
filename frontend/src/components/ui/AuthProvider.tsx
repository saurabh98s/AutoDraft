'use client';

import React, { createContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  checkAuth: async () => false,
});

const PUBLIC_PATHS = ['/login', '/', '/register', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { login: authLogin, logout: authLogout, isAuthenticated } = useAuth();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await authLogin();
      router.push('/dashboard');
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    authLogout();
    dispatch(logout());
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      return isAuthenticated;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Since useAuth already sets up authentication on mount,
    // we don't need to do additional checks or redirects here
    setIsLoading(false);
  }, []);


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout: logoutUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}