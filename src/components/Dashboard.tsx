"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  ChevronRight, 
  Loader2, 
  FolderOpen, 
  PlusCircle,
  Layers,
  Share2,
  LayoutGrid
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { ActionMenu } from './ActionMenu';
import { Workspace, MindMap } from '@/types/mindmap';
import { CreateWorkspaceModal } from './modals/CreateWorkspaceModal';
import { ShareModal } from './modals/ShareModal';
import { ShareResource } from '@/types/collaboration';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthProvider';

interface DashboardProps {
  onSelectMap: (id: string) => void;
  workspaceId?: string;
}

const Dashboard = ({ onSelectMap, workspaceId }: DashboardProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareResource, setShareResource] = useState<ShareResource | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Buscar Workspaces
      const { data: wsData } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (wsData) setWorkspaces(wsData);

      // Buscar Mapas (filtrados por workspace ou soltos)
      let query = supabase.from('maps').select('*').order('updated_at', { ascending: false });
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
        setActiveWorkspace(wsData?.find(w => w.id === workspaceId) || null);
      } else {
        query = query.is('workspace_id', null);
        setActiveWorkspace(null);
      }

      const { data: mapData } = await query;
      setMaps(mapData || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId, user]);

  const createNewMap = async () => {
    if (isCreating || !user) return;
    setIsCreating(true);
    try {
      const rootNodeId = uuidv4();
      const initialContent = {
        nodes: [
          {
            id: rootNodeId,
            type: 'mindmap',
            data: { label: 'Meu Mapa Mental', isNew: false },
            position: { x: 250, y: 250 },
          }
        ],
        edges: []
      };

      const { data, error } = await supabase
        .from('maps')
        .insert([{ 
          title: `Novo Mapa ${maps.length + 1}`, 
          user_id: user.id, 
          workspace_id: workspaceId || null, 
          content: initialContent 
        }])
        .select().single();

      if (error) throw error;
      setMaps([data, ...maps]);
      showSuccess("Mapa criado!");
      onSelectMap(data.id);
    } catch (error: any) {
      showError(error.message || "Erro ao criar mapa.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateWorkspace = async (name: string, color: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, user_id: user.id, color }])
        .select().single();

      if (error) throw error;
      
      setWorkspaces(prev => [...prev, data]);
      showSuccess("Workspace criado!");
      window.dispatchEvent(new CustomEvent('workspace-created', { detail: data }));
    } catch (error: any) {
      showError(error.message || "Erro ao criar workspace.");
      throw error;
    }
  };

  const handleDeleteMap = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este mapa?")) return;
    try {
      const { error } = await supabase.from('maps').delete().eq('id', id);
      if (error) throw error;
      setMaps(prev => prev.filter(m => m.id !== id));
      showSuccess("Mapa excluído");
    } catch (error) {
      showError("Erro ao excluir mapa");
    }
  };

  const filteredMaps = maps.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <HomeIcon size={14} />
            <span>{workspaceId ? 'Workspaces' : 'Início'}</span>
            {workspaceId && (
              <>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-semibold">{activeWorkspace?.name}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            {workspaceId ? (
              <><div className="w-8 h-8 rounded-lg" style={{ backgroundColor: activeWorkspace?.color }} />{activeWorkspace?.name}</>
            ) : (
              "Seu Dashboard"
            )}
          </h1>
        </div>
        <div className="flex gap-4">
          {workspaceId && (
            <button 
              onClick={() => setShareResource({ id: workspaceId, type: 'workspace', name: activeWorkspace?.name || '' })}
              className="bg-white border border-gray-100 text-gray-600 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Share2 size={18} />
              Compartilhar
            </button>
          )}
          <button 
            onClick={createNewMap} 
            disabled={isCreating} 
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Novo Mapa
          </button>
        </div>
      </div>

      {/* Workspaces Section (Only on Root) */}
      {!workspaceId && workspaces.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 ml-1">Seus Workspaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => setIsModalOpen(true)} className="group p-8 border-2 border-dashed border-gray-200 rounded-[32px] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-4">
              <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                <PlusCircle size={32} />
              </div>
              <div><h3 className="font-bold text-gray-900">Novo Workspace</h3><p className="text-sm text-gray-400">Organize seus projetos</p></div>
            </button>
            {workspaces.map((ws) => (
              <div key={ws.id} className="group p-8 bg-white border border-gray-100 rounded-[32px] hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden" onClick={() => window.dispatchEvent(new CustomEvent('select-workspace', { detail: ws.id }))}>
                <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: ws.color }} />
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${ws.color}15`, color: ws.color }}><Layers size={24} /></div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShareResource({ id: ws.id, type: 'workspace', name: ws.name }); }}
                      className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                    >
                      <Share2 size={18} />
                    </button>
                    <ActionMenu onDelete={() => {}} label="Workspace" />
                  </div>
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-1">{ws.name}</h3>
                <p className="text-sm text-gray-400 font-medium">Workspace de Projetos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maps Section */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 ml-1">
          {workspaceId ? 'Mapas neste Workspace' : 'Mapas Recentes'}
        </h2>
        {filteredMaps.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
            <FileText className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-medium">Nenhum mapa encontrado aqui.</p>
            <button onClick={createNewMap} className="mt-4 text-blue-600 font-bold hover:underline">Criar meu primeiro mapa</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredMaps.map((map) => (
              <div key={map.id} onClick={() => onSelectMap(map.id)} className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors"><FileText className="text-gray-400 group-hover:text-blue-600" size={28} /></div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShareResource({ id: map.id, type: 'map', name: map.title }); }}
                      className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                    >
                      <Share2 size={16} />
                    </button>
                    <ActionMenu onDelete={() => handleDeleteMap(map.id)} label="Mapa" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-900 truncate">{map.title}</h3>
                <p className="text-sm text-gray-400 mt-1">Atualizado em {new Date(map.updated_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateWorkspace} 
      />

      {shareResource && (
        <ShareModal 
          isOpen={!!shareResource} 
          onClose={() => setShareResource(null)} 
          resource={shareResource} 
        />
      )}
    </div>
  );
};

const HomeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

export default Dashboard;