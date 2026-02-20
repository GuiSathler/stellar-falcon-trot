"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, PermissionAction, UserRole } from '@/types/auth';

export function usePermissions() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, role, plan_type')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const hasPermission = (action: PermissionAction, mapOwnerId?: string): boolean => {
    if (!profile) return false;
    if (profile.role === 'super_admin') return true;

    const isOwner = mapOwnerId === profile.id;

    switch (action) {
      case 'delete':
        return isOwner || profile.role === 'admin';
      case 'edit':
      case 'create':
        return isOwner || profile.role === 'admin' || profile.role === 'editor';
      case 'export':
        return profile.plan_type === 'pro';
      case 'share':
        return isOwner || profile.role === 'admin';
      default:
        return false;
    }
  };

  return { profile, hasPermission, loading };
}