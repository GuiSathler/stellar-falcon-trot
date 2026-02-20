export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';
export type PlanType = 'free' | 'pro';

export interface UserProfile {
  id: string;
  role: UserRole;
  plan_type: PlanType;
}

export type PermissionAction = 'create' | 'edit' | 'delete' | 'share' | 'export';