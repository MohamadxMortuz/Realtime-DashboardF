import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally, decode token to get user info, or set a placeholder
      setUser({ id: '', email: '', name: '' }); // Placeholder, since backend does not return user info
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authAPI.login(username, password);
    // result is { token }
    localStorage.setItem('token', result.token);
    setUser({ id: '', email: '', name: username }); // Set username as name, rest empty
  };

  const signup = async (username: string, email: string, password: string) => {
    await authAPI.signup(username, email, password);
    // After signup, user must login
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};