"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, PermissionAction } from '@/types/auth';
import { useAuth } from '@/components/AuthProvider';

/**
 * HOOK DE PERMISSÕES (UX APENAS)
 * 
 * IMPORTANTE: Este hook serve apenas para fins de interface (esconder/mostrar botões).
 * Ele NÃO é uma barreira de segurança. A segurança real é garantida pelas políticas 
 * de Row Level Security (RLS) no Supabase.
 */
export function usePermissions() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, role, plan_type')
          .eq('id', user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }
    
    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  const hasPermission = (action: PermissionAction, mapOwnerId?: string): boolean => {
    if (!profile) return false;
    
    // Super admins sempre têm permissão na UI
    if (profile.role === 'super_admin') return true;

    const isOwner = mapOwnerId === profile.id;

    switch (action) {
      case 'delete':
        // Apenas donos ou admins globais podem ver o botão de deletar
        return isOwner || profile.role === 'admin';
      case 'edit':
      case 'create':
        // Donos, admins ou editores podem ver ferramentas de edição
        return isOwner || profile.role === 'admin' || profile.role === 'editor';
      case 'export':
        return profile.plan_type === 'pro';
      case 'share':
        return isOwner || profile.role === 'admin';
      default:
        return false;
    }
  };

  return { profile, hasPermission, loading: loading || authLoading };
}