"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Plus, ChevronRight, Search, Loader2, Crown, FolderOpen, LayoutGrid } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { usePermissions } from '@/hooks/usePermissions';
import { ActionMenu } from './ActionMenu';
import { Workspace } from '@/types/mindmap';

interface DashboardProps {
  onSelectMap: (id: string) => void;
  workspaceId?: string;
}

const Dashboard = ({ onSelectMap, workspaceId }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [maps, setMaps] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const { profile } = usePermissions();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os workspaces para o menu de mover
      const { data: wsData } = await supabase.from('workspaces').select('*');
      if (wsData) setWorkspaces(wsData);

      let query = supabase
        .from('maps')
        .select('*')
        .order('updated_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
        const currentWs = wsData?.find(w => w.id === workspaceId);
        setActiveWorkspace(currentWs || null);
      } else {
        setActiveWorkspace(null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMaps(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const createNewMap = async () => {
    if (isCreating) return;
    
    if (profile?.plan_type === 'free' && maps.length >= 3) {
      return showError("Limite de 3 mapas atingido no plano Free.");
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('maps')
        .insert([
          { 
            title: `Novo Mapa ${maps.length + 1}`, 
            user_id: user.id,
            workspace_id: workspaceId || null,
            content: { nodes: [], edges: [] }
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setMaps([data, ...maps]);
      showSuccess("Mapa criado!");
      onSelectMap(data.id);
    } catch (error: any) {
      showError("Erro ao criar mapa.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMap = async (id: string) => {
    if (!confirm("Excluir este mapa?")) return;
    try {
      const { error } = await supabase.from('maps').delete().eq('id', id);
      if (error) throw error;
      setMaps(maps.filter(m => m.id !== id));
      showSuccess("Mapa excluído.");
    } catch (error: any) {
      showError("Erro ao excluir.");
    }
  };

  const handleRenameMap = async (id: string, currentTitle: string) => {
    const newTitle = prompt("Novo título:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    try {
      const { error } = await supabase.from('maps').update({ title: newTitle }).eq('id', id);
      if (error) throw error;
      setMaps(maps.map(m => m.id === id ? { ...m, title: newTitle } : m));
      showSuccess("Renomeado!");
    } catch (error) {
      showError("Erro ao renomear.");
    }
  };

  const handleMoveMap = async (mapId: string, targetWorkspaceId: string) => {
    try {
      const { error } = await supabase
        .from('maps')
        .update({ workspace_id: targetWorkspaceId || null })
        .eq('id', mapId);
      
      if (error) throw error;
      
      if (workspaceId) {
        setMaps(maps.filter(m => m.id !== mapId));
      } else {
        fetchData();
      }
      showSuccess("Mapa movido com sucesso!");
    } catch (error) {
      showError("Erro ao mover mapa.");
    }
  };

  const filteredMaps = maps.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <FolderOpen size={14} />
            <span>Workspaces</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-semibold">
              {activeWorkspace?.name || "Todos os Projetos"}
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            {activeWorkspace ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: activeWorkspace.color }} />
                {activeWorkspace.name}
              </div>
            ) : "Meus Mapas"}
            {profile?.plan_type === 'pro' && (
              <span className="bg-amber-100 text-amber-600 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Crown size={12} /> PRO
              </span>
            )}
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar mapas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none w-full md:w-64 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
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

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : filteredMaps.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900">Nenhum mapa aqui</h3>
          <p className="text-gray-500">Crie um novo mapa para começar a organizar suas ideias.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredMaps.map((map) => (
            <div 
              key={map.id}
              onClick={() => onSelectMap(map.id)}
              className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <FileText className="text-gray-400 group-hover:text-blue-600" size={28} />
                </div>
                <ActionMenu 
                  onDelete={() => handleDeleteMap(map.id)} 
                  onRename={() => handleRenameMap(map.id, map.title)}
                  onMove={(wsId) => handleMoveMap(map.id, wsId)}
                  workspaces={workspaces.filter(w => w.id !== map.workspace_id)}
                  label="Mapa" 
                />
              </div>
              <h3 className="font-bold text-xl text-gray-900 truncate">{map.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Atualizado em {new Date(map.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;