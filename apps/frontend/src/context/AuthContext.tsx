'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().or(z.number()),
  email: z.string().email(),
  name: z.string().nullish(),
  role: z.string(),
  phone: z.string().nullish(),
  gender: z.string().nullish(),
  birthday: z.string().nullish(),
}).catchall(z.any());

const baseApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

export const apiClient = setupCache(baseApiClient, {
  ttl: 1000 * 60 * 5, // 5 minutes cache for all GET requests
  methods: ['get'],
});

if (typeof window !== 'undefined') {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  apiClient.defaults.headers.common['x-session-id'] = sessionId;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error (e.g. server down)
      toast.error("Unable to connect to the server. Please check your internet connection.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isClient = typeof window !== 'undefined';

    if (status === 401) {
      if (isClient) {
        localStorage.removeItem('access_token');
        delete apiClient.defaults.headers.common['Authorization'];
        
        // Do not redirect if the failure was from a login attempt
        if (error.config && error.config.url && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/verify-2fa-login'))) {
          return Promise.reject(error);
        }

        // Prevent redirect loop if already on home page
        if (window.location.pathname !== '/') {
          toast.error("Your session has expired. Please log in again.");
          window.dispatchEvent(new Event('unauthorized'));
        }
      }
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 429) {
      toast.warning("Please slow down. You are making too many requests.");
    } else if (status >= 500) {
      toast.error("Our servers are experiencing an issue. Please try again later.");
    }

    return Promise.reject(error);
  }
);

interface AuthContextType {
  user: z.infer<typeof UserSchema> | null;
  token: string | null;
  loading: boolean;
  login: (data: any) => Promise<any>;
  verify2faLogin: (data: any) => Promise<any>;
  verifyOtp: (data: { email: string; otp: string }) => Promise<any>;
  signup: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<boolean>;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'signup' | 'verification-pending' | 'forgot-password';
  openAuthModal: (view?: 'login' | 'signup' | 'verification-pending' | 'forgot-password') => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: 'login' | 'signup' | 'verification-pending' | 'forgot-password') => void;
  setToken: (token: string | null) => void;
  setUser: (user: z.infer<typeof UserSchema> | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<z.infer<typeof UserSchema> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup' | 'verification-pending' | 'forgot-password'>('login');
  const router = useRouter();

  const openAuthModal = (view: 'login' | 'signup' | 'verification-pending' | 'forgot-password' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };
  
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken);
      
      apiClient.get('/users/profile')
        .then(res => {
          try {
            const parsedUser = UserSchema.parse(res.data);
            setUser(parsedUser);
          } catch (validationError) {
            console.error("API Response Validation Failed (User Profile):", validationError);
            toast.error("Received invalid data from the server.");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch user profile", err);
          // Fallback to parsing token if profile fetch fails
          try {
            const payloadStr = atob(storedToken.split('.')[1]);
            const payload = JSON.parse(payloadStr);
            setUser({ id: payload.sub, email: payload.email, role: payload.role, phone: payload.phone }); 
          } catch (e) {
            setUser({ id: 'fallback', email: 'loaded@example.com', role: 'user' });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      openAuthModal('login');
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/my-account')) {
        router.push('/');
      }
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [router]);

  const login = async (data: any) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      
      if (res.data.twoFactorRequired) {
        return { twoFactorRequired: true, tempToken: res.data.tempToken };
      }

      localStorage.setItem('access_token', res.data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      setToken(res.data.access_token);
      
      const parsedUser = UserSchema.parse(res.data.user);
      setUser(parsedUser);
      
      toast.success('Logged in successfully!');
      closeAuthModal();
      return { success: true };
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || 'Login failed');
      toast.error(errorText);
      return { success: false, error: errorText };
    }
  };

  const verify2faLogin = async (data: any) => {
    try {
      const res = await apiClient.post('/auth/verify-2fa-login', data);
      localStorage.setItem('access_token', res.data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      setToken(res.data.access_token);
      
      const parsedUser = UserSchema.parse(res.data.user);
      setUser(parsedUser);
      
      toast.success('Logged in successfully!');
      closeAuthModal();
      return { success: true };
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || '2FA Verification failed');
      toast.error(errorText);
      return { success: false, error: errorText };
    }
  };

  const verifyOtp = async (data: { email: string; otp: string }) => {
    try {
      const res = await apiClient.post('/auth/verify-email', data);
      localStorage.setItem('access_token', res.data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      setToken(res.data.access_token);
      
      const parsedUser = UserSchema.parse(res.data.user);
      setUser(parsedUser);
      
      toast.success(res.data.message || 'Email verified successfully!');
      closeAuthModal();
      return { success: true };
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || 'Verification failed');
      toast.error(errorText);
      return { success: false, error: errorText };
    }
  };

  const signup = async (data: any) => {
    try {
      const res = await apiClient.post('/auth/signup', data);
      
      // Backend returns { message, userId } - email verification is required before login
      toast.success(res.data.message || 'Signed up successfully! Please check your email for the code.');
      setAuthModalView('verification-pending');
      return { success: true };
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || 'Signup failed');
      return { success: false, error: errorText };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('access_token');
      delete apiClient.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      toast.info('Logged out');
      router.push('/');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await apiClient.patch('/users/profile', data);
      const parsedUser = UserSchema.parse(res.data);
      setUser(parsedUser);
      toast.success('Profile updated successfully!');
      return true;
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || 'Failed to update profile');
      toast.error(errorText);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, verify2faLogin, verifyOtp, signup, logout, updateProfile, isAuthModalOpen, authModalView, openAuthModal, closeAuthModal, setAuthModalView, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
