// Auth Context

import { authService } from '@/services/authService';
import type { TipoUsuario } from '@/services/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  tipoUsuario: TipoUsuario | null;
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = authService.isAuthenticated();
    const userType = authService.getUserType();
    
    setIsAuthenticated(authenticated);
    setTipoUsuario(userType);
    setIsLoading(false);
  }, []);

  const login = async (usuario: string, senha: string) => {
	    const response = await authService.login(usuario, senha);
	    const tipo = response.tipoUsuario?.toString().trim().toUpperCase();
	    setIsAuthenticated(true);
	    if (tipo === 'ALUNO' || tipo === 'RESPONSAVEL') {
	    setTipoUsuario(tipo);
	    localStorage.setItem('tipoUsuario', tipo);
	  } else {
	    console.warn('Tipo de usuário inválido recebido:', response.tipoUsuario);
	    setTipoUsuario(null);
	  }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setTipoUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, tipoUsuario, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}