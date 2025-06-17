import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import React from 'react';

interface User {
  email: string;
  role: string;
  id?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  isAuthChecked: boolean; // إعادة إضافة حالة جديدة لتتبع اكتمال التحقق الأولي
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // تعريف الحالة الجديدة
  const router = useRouter();

  // دالة للتحقق من المصادقة
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('useAuth: Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setIsAuthChecked(true);
    }
  }, []);

  // التحقق من المصادقة عند تحميل التطبيق
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    console.log('useAuth: user =', user, 'loading =', loading, 'isAuthChecked =', isAuthChecked);
  }, [user, loading, isAuthChecked]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser({ email: data.user.email, role: data.user.role });
        await checkAuth();
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.error || 'بيانات تسجيل الدخول غير صحيحة' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: 'حدث خطأ غير متوقع. حاول مرة أخرى.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to log out');
      }
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isLoading: loading, // Alias for compatibility
    isAuthChecked // إضافة الحالة الجديدة إلى السياق
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 