import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  loading: boolean;
  login: (token: string, user: User, workspaces: Workspace[]) => void;
  logout: () => void;
  setActiveWorkspaceId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(
    localStorage.getItem('heed_active_workspace')
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('heed_token');
    if (token) {
      api.getMe()
      .then(data => {
        setUser(data.user);
        setWorkspaces(data.workspaces);
        const currentActive = localStorage.getItem('heed_active_workspace');
        const isValid = data.workspaces.some((w: Workspace) => w.id === currentActive);
        if (!isValid && data.workspaces.length > 0) {
          const defaultId = data.workspaces[0].id;
          localStorage.setItem('heed_active_workspace', defaultId);
          setActiveWorkspaceIdState(defaultId);
        } else if (isValid && currentActive) {
          setActiveWorkspaceIdState(currentActive);
        }
      })
      .catch(() => {
        localStorage.removeItem('heed_token');
        localStorage.removeItem('heed_active_workspace');
        setUser(null);
        setWorkspaces([]);
        setActiveWorkspaceIdState(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, newUser: User, newWorkspaces: Workspace[]) => {
    localStorage.setItem('heed_token', token);
    setUser(newUser);
    setWorkspaces(newWorkspaces);
    if (newWorkspaces.length > 0) {
      setActiveWorkspaceId(newWorkspaces[0].id);
    }
  };

  const logout = () => {
    localStorage.removeItem('heed_token');
    localStorage.removeItem('heed_active_workspace');
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspaceIdState(null);
  };

  const setActiveWorkspaceId = (id: string) => {
    localStorage.setItem('heed_active_workspace', id);
    setActiveWorkspaceIdState(id);
  };

  return (
    <AuthContext.Provider value={{ user, workspaces, activeWorkspaceId, loading, login, logout, setActiveWorkspaceId }}>
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
