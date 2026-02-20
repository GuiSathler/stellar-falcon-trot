"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  ChevronRight, 
  Search, 
  Loader2, 
  FolderOpen, 
  PlusCircle,
  ArrowRight,
  Layers
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { ActionMenu } from './ActionMenu';
import { Workspace, MindMap } from '@/types/mindmap';
import { CreateWorkspaceModal } from './modals/CreateWorkspaceModal';
import { v4 as uuidv4 } from 'uuid';

interface DashboardProps {
  onSelectMap: (id: string) => void;
  workspaceId?: string;
}

const Dashboard = ({ onSelectMap, workspaceId }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wsData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (wsData) setWorkspaces(wsData);

      if (workspaceId) {
        const { data: mapData } = await supabase
          .from('maps')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('updated_at', { ascending: false });
        setMaps(mapData || []);
        setActiveWorkspace(wsData?.find(w => w.id === workspaceId) || null);
      } else {
        const { data: mapData } = await supabase
          .from('maps')
          .select('*')
          .is('workspace_id', null)
          .order('updated_at', { ascending: false });
        setMaps(mapData || []);
        setActiveWorkspace(null);
      }
    } catch (error) {
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
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Criar conteúdo inicial com nó raiz
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
      showSuccess("Mapa criado com nó inicial!");
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
      showSuccess("Mapa excluído com sucesso");
    } catch (error) {
      showError("Erro ao excluir mapa");
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm("Excluir este workspace excluirá todos os mapas dentro dele. Continuar?")) return;
    try {
      const { error } = await supabase.from('workspaces').delete().eq('id', id);
      if (error) throw error;
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      showSuccess("Workspace removido");
    } catch (error) {
      showError("Erro ao excluir workspace");
    }
  };

  const handleCreateWorkspace = async (name: string, color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, user_id: user?.id, color }])
        .select().single();
      if (error) throw error;
      setWorkspaces([...workspaces, data]);
      showSuccess("Workspace criado!");
    } catch (error) {
      showError("Erro ao criar workspace.");
    }
  };

  const filteredMaps = maps.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500 font-medium">Organizando seu espaço...</p>
    </div>
  );

  if (!workspaceId) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Bem-vindo ao Boltz Flow</h1>
          <p className="text-gray-500 font-medium">Selecione um workspace para começar a trabalhar.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => setIsModalOpen(true)} className="group p-8 border-2 border-dashed border-gray-200 rounded-[32px] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
              <PlusCircle size={32} />
            </div>
            <div><h3 className="font-bold text-gray-900">Novo Workspace</h3><p className="text-sm text-gray-400">Crie um espaço para seus projetos</p></div>
          </button>
          {workspaces.map((ws) => (
            <div key={ws.id} className="group p-8 bg-white border border-gray-100 rounded-[32px] hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden" onClick={() => window.dispatchEvent(new CustomEvent('select-workspace', { detail: ws.id }))}>
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: ws.color }} />
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${ws.color}15`, color: ws.color }}><Layers size={24} /></div>
                <div className="flex items-center gap-2">
                  <ActionMenu onDelete={() => handleDeleteWorkspace(ws.id)} label="Workspace" />
                  <ArrowRight className="text-gray-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </div>
              <h3 className="font-black text-xl text-gray-900 mb-1">{ws.name}</h3>
              <p className="text-sm text-gray-400 font-medium">Workspace de Projetos</p>
            </div>
          ))}
        </div>
        {maps.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText size={20} className="text-gray-400" />Mapas Avulsos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {maps.map((map) => (
                <div key={map.id} onClick={() => onSelectMap(map.id)} className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all cursor-pointer relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 truncate flex-1">{map.title}</h3>
                    <ActionMenu onDelete={() => handleDeleteMap(map.id)} label="Mapa" />
                  </div>
                  <p className="text-xs text-gray-400">Sem workspace definido</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <CreateWorkspaceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateWorkspace} 
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2"><FolderOpen size={14} /><span>Workspaces</span><ChevronRight size={14} /><span className="text-gray-900 font-semibold">{activeWorkspace?.name}</span></div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3"><div className="w-8 h-8 rounded-lg" style={{ backgroundColor: activeWorkspace?.color }} />{activeWorkspace?.name}</h1>
        </div>
        <div className="flex gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Pesquisar mapas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none w-full md:w-64 focus:ring-2 focus:ring-blue-100 transition-all" /></div>
          <button onClick={createNewMap} disabled={isCreating} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50">{isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}Novo Mapa</button>
        </div>
      </div>
      {filteredMaps.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6"><FileText className="text-gray-200" size={40} /></div>
          <h3 className="text-xl font-black text-gray-900 mb-2">Este workspace está vazio</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Comece criando seu primeiro mapa mental para organizar suas ideias neste espaço.</p>
          <button onClick={createNewMap} className="bg-white text-blue-600 border border-blue-100 px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm">Criar Primeiro Mapa</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredMaps.map((map) => (
            <div key={map.id} onClick={() => onSelectMap(map.id)} className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors"><FileText className="text-gray-400 group-hover:text-blue-600" size={28} /></div>
                <ActionMenu onDelete={() => handleDeleteMap(map.id)} label="Mapa" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 truncate">{map.title}</h3>
              <p className="text-sm text-gray-400 mt-1">Atualizado em {new Date(map.updated_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;