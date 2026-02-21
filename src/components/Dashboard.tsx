"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Loader2, 
  Layers, 
  Share2, 
  LayoutGrid, 
  List, 
  Filter, 
  ChevronDown, 
  Star, 
  User as UserIcon
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { ActionMenu } from './ActionMenu';
import { Workspace, MindMap } from '@/types/mindmap';
import { CreateWorkspaceModal } from './modals/CreateWorkspaceModal';
import { ShareModal } from './modals/ShareModal';
import { ShareResource } from '@/types/collaboration';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface DashboardProps {
  onSelectMap: (id: string) => void;
  workspaceId?: string;
  filterType?: 'all' | 'favorites' | 'recent';
}

const Dashboard = ({ onSelectMap, workspaceId, filterType = 'all' }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareResource, setShareResource] = useState<ShareResource | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wsData } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (wsData) setWorkspaces(wsData);

      let query = supabase.from('maps').select('*');

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      if (filterType === 'favorites') {
        // Nota: Em um app real, teríamos uma coluna 'is_favorite'. 
        // Aqui simularemos usando metadados ou uma lógica de filtro.
        query = query.not('title', 'is', null); // Placeholder para lógica de favoritos
      }

      const { data: mapData } = await query.order('updated_at', { ascending: false });
      setMaps(mapData || []);
      
      if (workspaceId) {
        setActiveWorkspace(wsData?.find(w => w.id === workspaceId) || null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId, filterType]);

  const createNewMap = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rootNodeId = uuidv4();
      const initialContent = {
        nodes: [{ id: rootNodeId, type: 'mindmap', data: { label: 'Novo Mapa', isNew: false }, position: { x: 250, y: 250 } }],
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
    } catch (error) {
      showError("Erro ao criar mapa.");
    } finally {
      setIsCreating(false);
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

  const handleRenameMap = async (id: string, oldTitle: string) => {
    const newTitle = prompt("Novo nome do mapa:", oldTitle);
    if (!newTitle || newTitle === oldTitle) return;

    try {
      const { error } = await supabase.from('maps').update({ title: newTitle }).eq('id', id);
      if (error) throw error;
      setMaps(prev => prev.map(m => m.id === id ? { ...m, title: newTitle } : m));
      showSuccess("Mapa renomeado");
    } catch (error) {
      showError("Erro ao renomear");
    }
  };

  const handleMoveMap = async (mapId: string, newWorkspaceId: string) => {
    try {
      const { error } = await supabase
        .from('maps')
        .update({ workspace_id: newWorkspaceId || null })
        .eq('id', mapId);
      
      if (error) throw error;
      if (workspaceId) {
        setMaps(prev => prev.filter(m => m.id !== mapId));
      }
      showSuccess("Mapa movido com sucesso");
    } catch (error) {
      showError("Erro ao mover mapa");
    }
  };

  const filteredMaps = maps.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {workspaceId ? activeWorkspace?.name : filterType === 'favorites' ? "Seus Favoritos" : "Seus Mapas"}
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquise seus mapas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            />
          </div>
          
          <button 
            onClick={() => setShareResource({ id: workspaceId || '', type: 'workspace', name: activeWorkspace?.name || 'Geral' })}
            className="p-3 hover:bg-gray-100 rounded-2xl text-gray-500 transition-all"
          >
            <Share2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {!workspaceId && filterType === 'all' && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Workspaces</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <TemplateCard icon={Plus} label="Novo Workspace" onClick={() => setIsModalOpen(true)} isPrimary />
              {workspaces.map((ws) => (
                <TemplateCard 
                  key={ws.id}
                  icon={Layers} 
                  label={ws.name}
                  color={ws.color}
                  onClick={() => window.dispatchEvent(new CustomEvent('select-workspace', { detail: ws.id }))}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-black text-gray-900">Mapas</h2>
              <div className="flex items-center gap-2">
                <FilterButton label="Recentes" onClick={() => fetchData()} />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={createNewMap}
                disabled={isCreating}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-100"
              >
                {isCreating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                Criar novo
              </button>

              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg", viewMode === 'grid' ? "bg-white shadow-sm text-blue-600" : "text-gray-400")}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg", viewMode === 'list' ? "bg-white shadow-sm text-blue-600" : "text-gray-400")}><List size={18} /></button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : filteredMaps.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-bold">Nenhum mapa encontrado.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMaps.map((map) => (
                <div key={map.id} onClick={() => onSelectMap(map.id)} className="group bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all cursor-pointer">
                  <div className="aspect-video bg-gray-50 flex items-center justify-center relative">
                    <FileText className="text-gray-200" size={64} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 truncate flex-1">{map.title}</h3>
                      <ActionMenu 
                        onDelete={() => handleDeleteMap(map.id)} 
                        onRename={() => handleRenameMap(map.id, map.title)}
                        onMove={(wsId) => handleMoveMap(map.id, wsId)}
                        workspaces={workspaces}
                        label="Mapa" 
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                      <UserIcon size={12} />
                      <span>{new Date(map.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Modificado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaps.map((map) => (
                    <tr key={map.id} onClick={() => onSelectMap(map.id)} className="group hover:bg-blue-50/30 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><FileText size={20} /></div>
                          <span className="font-bold text-gray-900">{map.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">{new Date(map.updated_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ActionMenu 
                            onDelete={() => handleDeleteMap(map.id)} 
                            onRename={() => handleRenameMap(map.id, map.title)}
                            onMove={(wsId) => handleMoveMap(map.id, wsId)}
                            workspaces={workspaces}
                            label="Mapa" 
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={async (n, c) => { await fetchData(); }} />
      {shareResource && <ShareModal isOpen={!!shareResource} onClose={() => setShareResource(null)} resource={shareResource} />}
    </div>
  );
};

const TemplateCard = ({ icon: Icon, label, onClick, isPrimary, color }: any) => (
  <button onClick={onClick} className={cn("group flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] border-2 transition-all", isPrimary ? "bg-white border-dashed border-gray-200 hover:border-blue-400" : "bg-gray-50 border-transparent hover:bg-white hover:shadow-lg")}>
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isPrimary ? "bg-gray-100 text-gray-400" : "bg-white shadow-sm")}>
      {color ? <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} /> : <Icon size={24} />}
    </div>
    <span className="text-[11px] font-bold text-gray-600 truncate w-full">{label}</span>
  </button>
);

const FilterButton = ({ label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
    {label}
    <ChevronDown size={14} className="text-gray-400" />
  </button>
);

export default Dashboard;