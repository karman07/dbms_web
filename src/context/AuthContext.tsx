import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { authAPI } from '../utils/api';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'ADMIN' || parsedUser.role === 'admin') {
          setUser(parsedUser);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Handle different API response formats
      const userData = response.user;
      const token = response.token || response.access_token;
      
      if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'admin')) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Normalize user data format
      const normalizedUser: AuthUser = {
        id: userData._id || userData.id,
        email: userData.email.replace('mailto:', ''), // Remove mailto: prefix if present
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role.toUpperCase() as 'ADMIN',
        isEmailVerified: userData.isEmailVerified
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};