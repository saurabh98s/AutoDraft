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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { login: authLogin, logout: authLogout, checkAuth: authCheck } = useAuth();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, exp } = await authLogin(email, password);
      dispatch(loginSuccess({ user, exp }));
      setIsAuthenticated(true);
      router.push('/dashboard');
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
    setIsAuthenticated(false);
    router.push('/login');
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const result = await authCheck();
      setIsAuthenticated(result);
      return result;
    } catch (error) {
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const isAuth = await checkAuth();
      
      if (!isAuth && !PUBLIC_PATHS.includes(pathname)) {
        router.push('/login');
      }
    };

    initAuth();
  }, [pathname]);

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