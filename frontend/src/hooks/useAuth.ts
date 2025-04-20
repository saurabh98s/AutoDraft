import { useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useDispatch, useSelector } from 'react-redux';
  import {
    loginStart,
    loginSuccess,
    loginFailure,
    logout as logoutAction,
    refreshToken as refreshTokenAction,
  } from '../store/slices/authSlice';
  import { RootState } from '../store';
  import {
    login as loginApi,
    register as registerApi,
    refreshToken as refreshTokenApi,
    useAuth as useAuthApi,
  } from '../lib/api';
  import { ROLES } from '../lib/constants';

  // -------------------------------- Constants ---------------------------------
  const ADMIN_USER = {
    email: 'admin@autodraft.app',
    password: 'Admin@123',
    id: 'admin-1',
    username: 'Admin User',
    organization_id: 'org-1',
  };
  // Fallback lifetime for access tokens (ms)
  const ACCESS_LIFETIME = 60 * 60 * 1000; // 1 hour
  const AUTH_STORAGE_KEY = 'autodraft_auth_state';

  // ------------------------------ useAuth Hook --------------------------------
  export const useAuth = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { user, isAuthenticated, isLoading, error } = useSelector(
      (state: RootState) => state.auth
    );

    // Skip API calls for admin user
    const { data: userData, error: userError } = useAuthApi({
      skip: user?.email === ADMIN_USER.email,
    });

    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

    // ---------------- Load auth state from localStorage on mount ----------------
    useEffect(() => {
      // Try to load auth state from localStorage
      const loadAuthState = () => {
        try {
          const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
          if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            // Only restore if not expired
            if (authData.accessExp > Date.now()) {
              dispatch(loginSuccess({
                user: authData.user,
                accessExp: authData.accessExp
              }));
              return true;
            } else {
              // Clear expired auth data
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          }
        } catch (err) {
          console.error('Failed to load auth state from localStorage', err);
        }
        return false;
      };

      // Skip for admin user or if already authenticated
      if (!isAuthenticated && user?.email !== ADMIN_USER.email) {
        loadAuthState();
      }
    }, [dispatch, isAuthenticated, user]);

    // ---------------- Bootstrap auth state on mount -------------------------
    useEffect(() => {
      // Skip bootstrap for admin user
      if (user?.email === ADMIN_USER.email) {
        return;
      }

      if (userData && !isAuthenticated) {
        const authData = { 
          user: userData, 
          accessExp: Date.now() + ACCESS_LIFETIME 
        };
        dispatch(loginSuccess(authData));
        
        // Save to localStorage
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        } catch (err) {
          console.error('Failed to save auth state to localStorage', err);
        }
      } else if (userError && isAuthenticated) {
        dispatch(logoutAction());
        localStorage.removeItem(AUTH_STORAGE_KEY);
        router.replace('/login');
      }
    }, [userData, userError, isAuthenticated, user, dispatch, router]);

    // --------------------- Refresh token heartbeat ---------------------------
    useEffect(() => {
      // Skip refresh for admin user
      if (user?.email === ADMIN_USER.email) {
        return;
      }

      if (isAuthenticated) {
        const id = setInterval(async () => {
          try {
            const { accessExp } = await refreshTokenApi();
            dispatch(refreshTokenAction(accessExp));
            
            // Update localStorage with new expiration
            try {
              const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
              if (savedAuth) {
                const authData = JSON.parse(savedAuth);
                authData.accessExp = accessExp;
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
              }
            } catch (err) {
              console.error('Failed to update auth state in localStorage', err);
            }
          } catch (err) {
            console.error('Token refresh failed', err);
            dispatch(logoutAction());
            localStorage.removeItem(AUTH_STORAGE_KEY);
            router.replace('/login');
          }
        }, 5 * 60 * 1000);
        setRefreshInterval(id);
        return () => clearInterval(id);
      }
      // cleanup if logged out
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }, [isAuthenticated, user, dispatch, router]);

    // ------------------------ Actions ---------------------------------------
    const login = async (email: string, password: string) => {
      dispatch(loginStart());
      try {
        // Admin shortcut: bypass API completely
        if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
          const authData = {
            user: {
              id: ADMIN_USER.id,
              username: ADMIN_USER.username,
              email: ADMIN_USER.email,
              role: ROLES.ADMIN,
              organization_id: ADMIN_USER.organization_id,
            },
            accessExp: Date.now() + ACCESS_LIFETIME,
          };
          
          dispatch(loginSuccess(authData));
          
          // Save admin auth to localStorage
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
          } catch (err) {
            console.error('Failed to save admin auth to localStorage', err);
          }
          
          window.location.href = '/dashboard';
          return authData;
        }

        // Regular login flow
        const { user: apiUser, accessExp } = await loginApi(email, password);
        const authData = { user: apiUser, accessExp };
        dispatch(loginSuccess(authData));
        
        // Save to localStorage
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        } catch (err) {
          console.error('Failed to save auth state to localStorage', err);
        }
        
        router.replace('/dashboard');
        return authData;
      } catch (err: any) {
        dispatch(loginFailure('Invalid email or password'));
        throw err;
      }
    };

    const register = async (
      name: string,
      email: string,
      password: string,
      orgName?: string
    ) => {
      // Prevent registering with admin email
      if (email === ADMIN_USER.email) {
        dispatch(loginFailure('Cannot register with admin email'));
        throw new Error('Cannot register with admin email');
      }

      dispatch(loginStart());
      try {
        await registerApi(name, email, password, orgName);
        const { user: apiUser, accessExp } = await loginApi(email, password);
        const authData = { user: apiUser, accessExp };
        dispatch(loginSuccess(authData));
        
        // Save to localStorage
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        } catch (err) {
          console.error('Failed to save auth state to localStorage', err);
        }
        
        router.replace('/dashboard');
        return authData;
      } catch (err: any) {
        dispatch(loginFailure(err?.message ?? 'Registration failed'));
        throw err;
      }
    };

    const logout = () => {
      dispatch(logoutAction());
      localStorage.removeItem(AUTH_STORAGE_KEY);
      router.replace('/login');
    };

    const hasRole = (role: string) =>
      !!user && (user.role === role || user.role === ROLES.ADMIN);

    // --------------------------- Return API ---------------------------------
    return {
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout,
      hasRole,
      adminEmail: ADMIN_USER.email,
    };
  };