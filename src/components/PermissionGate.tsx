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

export const PermissionGate = ({ action, mapOwnerId, children, fallback = null }: PermissionGateProps) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) return null;
  if (!hasPermission(action, mapOwnerId)) return <>{fallback}</>;

  return <>{children}</>;
};