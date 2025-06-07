
"use client"; // Manter "use client" pois usa hooks como createContext e useContext

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { verifySession as verifyAuthSession, SessionPayload } from '@/lib/auth'; // Importar verifySession de auth.ts
// A action de logout será chamada diretamente, não precisa estar no contexto.

interface AuthContextType {
  isAuthenticated: boolean;
  user: SessionPayload | null;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>; // Função para revalidar o status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    console.log('[AuthContext] checkAuthStatus: Verificando sessão...');
    setIsLoading(true);
    try {
      // Não passamos 'request' aqui, pois estamos no lado do cliente.
      // verifyAuthSession usará `cookies()` do 'next/headers' que funciona em RSC e Server Actions.
      // Para uso client-side puro, idealmente teríamos uma API route.
      // Por simplicidade, vamos tentar chamar e ver se o middleware já protegeu.
      // Uma abordagem melhor para o client-side seria uma API route /api/auth/session
      const session = await verifyAuthSession();
      if (session) {
        setUser(session);
        console.log('[AuthContext] checkAuthStatus: Sessão válida encontrada para', session.email);
      } else {
        setUser(null);
        console.log('[AuthContext] checkAuthStatus: Nenhuma sessão válida.');
        // O middleware deve cuidar do redirecionamento se estivermos em uma rota protegida.
      }
    } catch (error) {
      console.error('[AuthContext] checkAuthStatus: Erro ao verificar sessão:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] checkAuthStatus: Verificação concluída.');
    }
  }, []);


  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    checkAuthStatus,
  };

  // O login e logout agora são primariamente Server Actions e redirecionamentos via middleware.
  // O AuthContext serve mais para prover o estado `isAuthenticated` e `user` para a UI.

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
