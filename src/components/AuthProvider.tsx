"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfileAndIdExists = async (userId: string) => {
    try {
      // Busca o perfil atual
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, share_id')
        .eq('id', userId)
        .maybeSingle();

      if (!profile) {
        // Se não existe perfil, cria um (o trigger do banco cuidará do share_id)
        await supabase.from('profiles').insert([{ id: userId }]);
      } else if (!profile.share_id) {
        // Se o perfil existe mas o share_id está nulo (usuário antigo), 
        // chamamos uma função ou forçamos o trigger via update
        // Como temos a função generate_unique_share_id no banco, 
        // o ideal é que o banco resolva, mas podemos forçar um update 
        // que dispare a lógica de preenchimento se configurado.
        
        // Tentativa de gerar via RPC se disponível ou apenas sinalizar
        console.log("[AuthProvider] Usuário antigo detectado sem Boltz ID. Sincronizando...");
        
        // Forçamos um update no campo updated_at para garantir que o trigger ou 
        // a lógica de banco seja acionada se houver um BEFORE UPDATE
        await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', userId);
      }
    } catch (error) {
      console.error("Erro ao verificar/garantir Boltz ID:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await ensureProfileAndIdExists(session.user.id);
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        await ensureProfileAndIdExists(session.user.id);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);