
"use client"; // Manter "use client" pois usa hooks como createContext e useContext

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionPayload } from '@/lib/auth'; // Corrigido: Importar apenas SessionPayload como tipo
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
    console.log('[AuthContext] checkAuthStatus: Iniciando verificação (agora passiva).');
    setIsLoading(true);
    // A verificação ativa da sessão foi removida daqui para evitar
    // a importação de APIs server-only no cliente.
    // O estado da sessão é primariamente gerenciado pelo middleware e Server Actions.
    // Poderíamos adicionar uma chamada a uma API route aqui para buscar o estado da sessão, se necessário.
    // Por enquanto, o estado do usuário será null até uma ação de login bem-sucedida ou
    // navegação protegida pelo middleware.
    // Simulação:
    // const sessionFromApi = await fetch('/api/auth/session').then(res => res.json());
    // if (sessionFromApi.user) setUser(sessionFromApi.user); else setUser(null);

    // Placeholder para simular o fim do carregamento
    // Em um cenário real, isso seria definido após uma chamada de API ou verificação.
    const sessionCookie = typeof window !== 'undefined' ? document.cookie.includes('ehs_session=') : false;
    if (!sessionCookie) { // Uma verificação muito superficial, apenas para exemplo
        setUser(null);
    }
    // Se o cookie existir, o middleware já teria redirecionado se fosse inválido em uma rota protegida.
    // O estado 'user' seria idealmente populado com dados reais do backend.

    setIsLoading(false);
    console.log('[AuthContext] checkAuthStatus: Verificação passiva concluída.');
  }, []);


  useEffect(() => {
    // O checkAuthStatus ainda pode ser chamado para lógica inicial do lado do cliente,
    // mas não pode mais chamar diretamente verifySession.
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Esta função seria chamada pela loginAction (indiretamente) após um login bem-sucedido
  // para atualizar o estado do contexto, mas o redirecionamento e o middleware cuidam disso.
  // Manter uma forma de atualizar o usuário se necessário por outras vias.
  // Exemplo: se precisarmos forçar uma atualização do user no contexto a partir de uma ação do cliente.
  const updateUserState = (newUserData: SessionPayload | null) => {
    setUser(newUserData);
    setIsLoading(false);
  }

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    checkAuthStatus,
  };

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

