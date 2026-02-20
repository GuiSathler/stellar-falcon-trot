export type CollaborationRole = 'admin' | 'editor' | 'viewer';

export interface Member {
  id: string;
  user_id: string;
  email?: string;
  role: CollaborationRole;
  created_at: string;
}

export interface ShareResource {
  id: string;
  type: 'workspace' | 'map';
  name: string;
}