import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { ApiService, apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  googleOAuth: (accessToken: string, idToken?: string) => Promise<void>;
  appleOAuth: (data: AppleOAuthData) => Promise<void>;
  getProfile: () => Promise<User>;
  checkStatus: () => Promise<{ authenticated: boolean; user: any }>;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

interface AppleOAuthData {
  identityToken: string;
  authorizationCode?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load auth data from cookies on app start
    const storedToken = Cookies.get('accessToken');
    const storedRefreshToken = Cookies.get('refreshToken');
    const storedUser = Cookies.get('user');

    if (storedToken && storedRefreshToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(userData);
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await ApiService.auth.login({ email, password });

      if (response.data.success) {
        const { user: userData, tokens } = response.data;

        setUser(userData);
        setToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);

        // Store in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 1 }); // 1 day
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 }); // 7 days
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });

        // Set authorization header
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${tokens.accessToken}`;

        toast.success(`Welcome back, ${userData.firstName}!`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await ApiService.auth.register(userData);

      if (response.data.success) {
        const { user: newUser, tokens } = response.data;

        setUser(newUser);
        setToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);

        // Store in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(newUser), { expires: 7 });

        // Set authorization header
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${tokens.accessToken}`;

        toast.success(
          `Welcome, ${newUser.firstName}! Account created successfully.`,
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint if we have a refresh token
      if (refreshToken) {
        await ApiService.auth.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call success
      setUser(null);
      setToken(null);
      setRefreshToken(null);

      // Remove from cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');

      // Remove authorization header
      delete apiClient.defaults.headers.common['Authorization'];

      toast.success('Logged out successfully');
    }
  };

  const refreshAccessToken = async (): Promise<void> => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await ApiService.auth.refresh(refreshToken);

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.tokens;

        setToken(accessToken);
        setRefreshToken(newRefreshToken);

        // Update cookies
        Cookies.set('accessToken', accessToken, { expires: 1 });
        Cookies.set('refreshToken', newRefreshToken, { expires: 7 });

        // Update authorization header
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${accessToken}`;
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  const googleOAuth = async (
    accessToken: string,
    idToken?: string,
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await ApiService.auth.googleOAuth({
        accessToken,
        idToken,
      });

      if (response.data.success) {
        const { user: userData, tokens } = response.data;

        setUser(userData);
        setToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);

        // Store in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });

        // Set authorization header
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${tokens.accessToken}`;

        toast.success(`Welcome, ${userData.firstName}!`);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Google authentication failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const appleOAuth = async (data: AppleOAuthData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await ApiService.auth.appleOAuth(data);

      if (response.data.success) {
        const { user: userData, tokens } = response.data;

        setUser(userData);
        setToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);

        // Store in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });

        // Set authorization header
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${tokens.accessToken}`;

        toast.success(`Welcome, ${userData.firstName}!`);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Apple authentication failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (): Promise<User> => {
    try {
      const response = await ApiService.auth.getProfile();
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error('Failed to fetch profile');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to fetch profile';
      toast.error(message);
      throw error;
    }
  };

  const checkStatus = async (): Promise<{
    authenticated: boolean;
    user: any;
  }> => {
    try {
      const response = await ApiService.auth.checkStatus();
      return response.data;
    } catch (error: any) {
      console.error('Status check failed:', error);
      return { authenticated: false, user: null };
    }
  };

  // Set up axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshAccessToken();
            return apiClient(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, refreshAccessToken]);

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    login,
    register,
    logout,
    refreshAccessToken,
    googleOAuth,
    appleOAuth,
    getProfile,
    checkStatus,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
