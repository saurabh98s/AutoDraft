import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginSuccess,
} from '../store/slices/authSlice';
import { RootState } from '../store';
import { ROLES } from '../lib/constants';

// -------------------------------- Constants ---------------------------------
const DUMMY_USER = {
  email: 'user@autodraft.app',
  password: 'password',
  id: 'user-123',
  username: 'Demo User',
  name: 'Demo User',
  organization_id: 'org-123',
  orgId: 'org-123',
  role: ROLES.ADMIN,
};

// Fallback lifetime for access tokens (ms)
const ACCESS_LIFETIME = 60 * 60 * 1000; // 1 hour
const AUTH_STORAGE_KEY = 'autodraft_auth_state';

// ------------------------------ useAuth Hook --------------------------------
export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // Auto-authenticate once on mount, but no redirects here
  useEffect(() => {
    // Create dummy auth data
    const authData = {
      user: {
        id: DUMMY_USER.id,
        username: DUMMY_USER.username,
        email: DUMMY_USER.email,
        role: DUMMY_USER.role,
        organization_id: DUMMY_USER.organization_id,
        name: DUMMY_USER.name,
        orgId: DUMMY_USER.orgId
      },
      accessExp: Date.now() + ACCESS_LIFETIME,
    };
    
    // Dispatch to Redux store
    dispatch(loginSuccess(authData));
    
    // Save to localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (err) {
      console.error('Failed to save auth state to localStorage', err);
    }
  }, [dispatch]);

  // ------------------------ Actions ---------------------------------------
  const login = async () => {
    // Always return success with dummy user
    const authData = {
      user: {
        id: DUMMY_USER.id,
        username: DUMMY_USER.username,
        email: DUMMY_USER.email,
        role: DUMMY_USER.role,
        organization_id: DUMMY_USER.organization_id,
        name: DUMMY_USER.name,
        orgId: DUMMY_USER.orgId
      },
      accessExp: Date.now() + ACCESS_LIFETIME,
    };
    
    dispatch(loginSuccess(authData));
    
    // Save dummy auth to localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (err) {
      console.error('Failed to save auth to localStorage', err);
    }
    
    router.push('/dashboard');
    return authData;
  };

  const register = async (name: string, email: string) => {
    // Always return success with dummy user
    const authData = {
      user: {
        id: DUMMY_USER.id,
        username: name || DUMMY_USER.username,
        email: email || DUMMY_USER.email,
        role: DUMMY_USER.role,
        organization_id: DUMMY_USER.organization_id,
        name: name || DUMMY_USER.name,
        orgId: DUMMY_USER.orgId
      },
      accessExp: Date.now() + ACCESS_LIFETIME,
    };
    
    dispatch(loginSuccess(authData));
    
    // Save to localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (err) {
      console.error('Failed to save auth state to localStorage', err);
    }
    
    router.push('/dashboard');
    return authData;
  };

  const logout = () => {
    // For demo purposes, just go to dashboard
    router.push('/dashboard');
  };

  const hasRole = () => true; // Always return true for role checks

  // --------------------------- Return API ---------------------------------
  return {
    user,
    isAuthenticated: true, // Always return authenticated
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    adminEmail: DUMMY_USER.email,
  };
};

export default useAuth;