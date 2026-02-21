"use client";

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionAction } from '@/types/auth';

interface PermissionGateProps {
  action: PermissionAction;
  mapOwnerId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate
 * 
 * Componente utilitário para renderização condicional baseada em permissões.
 * Lembre-se: Se o usuário burlar isso via console, o RLS do banco de dados 
 * ainda bloqueará a requisição maliciosa.
 */
export const PermissionGate = ({ action, mapOwnerId, children, fallback = null }: PermissionGateProps) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) return null;
  
  // Se não tiver permissão na UI, renderiza o fallback (ou nada)
  if (!hasPermission(action, mapOwnerId)) return <>{fallback}</>;

  return <>{children}</>;
};