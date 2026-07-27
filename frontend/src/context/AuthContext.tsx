import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  effectiveRole: UserRole;
  accessToken: string | null;
  login: (access: string, refresh: string, userData: User) => void;
  logout: () => void;
  setEffectiveRole: (newRole: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('mindlap_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => 
    localStorage.getItem('mindlap_access_token')
  );
  const [overrideRole, setOverrideRole] = useState<UserRole | null>(null);

  const role: UserRole = user ? user.role : 'psychologist';
  const effectiveRole: UserRole = overrideRole || role;

  const login = (access: string, refresh: string, userData: User) => {
    localStorage.setItem('mindlap_access_token', access);
    localStorage.setItem('mindlap_refresh_token', refresh);
    localStorage.setItem('mindlap_user', JSON.stringify(userData));
    setAccessToken(access);
    setUser(userData);
    setOverrideRole(null);
  };

  const logout = () => {
    localStorage.removeItem('mindlap_access_token');
    localStorage.removeItem('mindlap_refresh_token');
    localStorage.removeItem('mindlap_user');
    setAccessToken(null);
    setUser(null);
    setOverrideRole(null);
  };

  const setEffectiveRole = (newRole: UserRole) => {
    setOverrideRole(newRole);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      effectiveRole,
      accessToken,
      login,
      logout,
      setEffectiveRole,
      isAuthenticated: !!accessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
