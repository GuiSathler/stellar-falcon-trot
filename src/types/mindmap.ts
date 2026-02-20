export interface MindMap {
  id: string;
  title: string;
  workspace_id: string;
  user_id: string;
  content: any;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  user_id: string;
  color?: string;
  created_at: string;
}