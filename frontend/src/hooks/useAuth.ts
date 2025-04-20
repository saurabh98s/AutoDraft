import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout, refreshToken } from '../store/slices/authSlice';
import { RootState } from '../store';
import { login as loginApi, refreshToken as refreshTokenApi, useAuth as useAuthApi } from '../lib/api';
import { getTokenExpiry } from '../lib/jwt';
import { ROLES } from '../lib/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  const { data: userData, error: userError } = useAuthApi();
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (userData && !isAuthenticated) {
      dispatch(loginSuccess({ user: userData, accessExp: Date.now() + 3600000 }));
    } else if (userError && isAuthenticated) {
      dispatch(logout());
      router.push('/login');
    }
  }, [userData, userError, isAuthenticated, dispatch, router]);

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(async () => {
        try {
          const response = await refreshTokenApi();
          dispatch(refreshToken(response.accessExp));
        } catch (error) {
          console.error('Failed to refresh token:', error);
          dispatch(logout());
          router.push('/login');
        }
      }, 5 * 60 * 1000); // Refresh every 5 minutes
      
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated, dispatch, router]);

  const login = async (email: string, password: string) => {
    dispatch(loginStart());
    try {
      const response = await loginApi(email, password);
      dispatch(loginSuccess({ user: response.user, accessExp: response.accessExp }));
      router.push('/dashboard');
    } catch (error) {
      dispatch(loginFailure('Invalid email or password'));
    }
  };

  const logoutUser = () => {
    dispatch(logout());
    router.push('/login');
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.role === role || user.role === ROLES.ADMIN;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUser,
    hasRole,
  };
}; 