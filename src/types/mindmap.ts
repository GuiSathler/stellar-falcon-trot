export interface MindMap {
  id: string;
  title: string;
  lastModified: string;
  thumbnail?: string;
}

export interface Folder {
  id: string;
  name: string;
  maps: MindMap[];
  subfolders: Folder[];
}

export interface Workspace {
  id: string;
  name: string;
  folders: Folder[];
}