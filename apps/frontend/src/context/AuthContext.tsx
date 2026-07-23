'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Optional: redirect to login if not already there, 
        // but removing the token stops the loop.
      }
    }
    return Promise.reject(error);
  }
);

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (data: any) => Promise<any>;
  verify2faLogin: (data: any) => Promise<any>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken);
      try {
        const payloadStr = atob(storedToken.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        setUser({ id: payload.sub, email: payload.email, role: payload.role, phone: payload.phone }); 
      } catch (e) {
        // Fallback if parsing fails
        setUser({ email: 'loaded@example.com' });
      }
    }
    setLoading(false);
  }, []);

  const login = async (data: any) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      
      if (res.data.twoFactorRequired) {
        return { twoFactorRequired: true, tempToken: res.data.tempToken };
      }

      localStorage.setItem('access_token', res.data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      setToken(res.data.access_token);
      setUser(res.data.user);
      toast.success('Logged in successfully!');
      router.push('/account');
      return { success: true };
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || 'Login failed');
      toast.error(errorText);
      return { success: false };
    }
  };

  const verify2faLogin = async (data: any) => {
    try {
      const res = await apiClient.post('/auth/verify-2fa-login', data);
      localStorage.setItem('access_token', res.data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      setToken(res.data.access_token);
      setUser(res.data.user);
      toast.success('Logged in successfully!');
      router.push('/account');
      return { success: true };
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || '2FA Verification failed');
      toast.error(errorText);
      return { success: false };
    }
  };

  const signup = async (data: any) => {
    try {
      const res = await apiClient.post('/auth/signup', data);
      localStorage.setItem('access_token', res.data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      setToken(res.data.access_token);
      setUser(res.data.user);
      toast.success('Signed up successfully!');
      router.push('/account');
    } catch (e: any) {
      const msg = e.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || 'Signup failed');
      toast.error(errorText);
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
      router.push('/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, verify2faLogin, signup, logout }}>
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
