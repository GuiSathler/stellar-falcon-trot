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
  Layers,
  Share2,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  Star,
  MoreHorizontal,
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
}

const Dashboard = ({ onSelectMap, workspaceId }: DashboardProps) => {
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Banner (Upgrade) */}
      <div className="bg-blue-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <Sparkles size={14} />
          <span>Você atingiu o limite de 3 mapas editáveis. Desbloqueie mapas ilimitados agora.</span>
        </div>
        <button className="underline hover:text-blue-100 transition-colors">Fazer upgrade</button>
      </div>

      {/* Dashboard Header */}
      <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {workspaceId ? activeWorkspace?.name : "No que estamos trabalhando?"}
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquise ou pergunte qualquer coisa"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
              ⌘+K
            </div>
          </div>
          
          <button className="p-3 hover:bg-gray-100 rounded-2xl text-gray-500 transition-all relative">
            <Share2 size={20} />
          </button>
          
          <button 
            onClick={createNewMap}
            disabled={isCreating}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Criar novo
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {/* Templates Section */}
        {!workspaceId && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Templates para começar</h2>
              <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Ver todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <TemplateCard icon={Plus} label="Mapa em branco" onClick={createNewMap} isPrimary />
              <TemplateCard icon={Layers} label="Fluxograma" />
              <TemplateCard icon={FileText} label="Brainstorming" />
              <TemplateCard icon={Sparkles} label="IA Playground" />
              <TemplateCard icon={ArrowRight} label="Roadmap" />
              <TemplateCard icon={LayoutGrid} label="Miroverse" />
            </div>
          </section>
        )}

        {/* Boards Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-black text-gray-900">Mapas neste time</h2>
              <div className="flex items-center gap-2">
                <FilterButton label="Todos os mapas" />
                <FilterButton label="Qualquer título" />
                <FilterButton label="Última abertura" />
              </div>
            </div>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600")}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600")}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-400 font-bold">Carregando seus mapas...</p>
            </div>
          ) : filteredMaps.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Nenhum mapa encontrado</h3>
              <p className="text-gray-500 text-sm mb-6">Comece criando seu primeiro mapa mental.</p>
              <button onClick={createNewMap} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all">
                Criar meu primeiro mapa
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMaps.map((map) => (
                <div key={map.id} onClick={() => onSelectMap(map.id)} className="group bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="aspect-video bg-gray-50 flex items-center justify-center relative">
                    <FileText className="text-gray-200 group-hover:text-blue-100 transition-colors" size={64} />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white rounded-xl shadow-lg text-gray-400 hover:text-amber-500">
                        <Star size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 truncate flex-1">{map.title}</h3>
                      <ActionMenu onDelete={() => handleDeleteMap(map.id)} label="Mapa" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <UserIcon size={12} />
                      <span>Você</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(map.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Última abertura</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Titular</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaps.map((map) => (
                    <tr 
                      key={map.id} 
                      onClick={() => onSelectMap(map.id)}
                      className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{map.title}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Modificado em {new Date(map.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        {new Date(map.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                            U
                          </div>
                          <span className="text-sm font-medium text-gray-600">Você</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-amber-500 rounded-lg">
                            <Star size={16} />
                          </button>
                          <ActionMenu onDelete={() => handleDeleteMap(map.id)} label="Mapa" />
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

const TemplateCard = ({ icon: Icon, label, onClick, isPrimary }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "group flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] border-2 transition-all text-center",
      isPrimary 
        ? "bg-white border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30" 
        : "bg-gray-50 border-transparent hover:bg-white hover:border-blue-100 hover:shadow-lg"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
      isPrimary ? "bg-gray-100 group-hover:bg-blue-100 text-gray-400 group-hover:text-blue-600" : "bg-white text-gray-400 group-hover:text-blue-600 shadow-sm"
    )}>
      <Icon size={24} />
    </div>
    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900">{label}</span>
  </button>
);

const FilterButton = ({ label }: { label: string }) => (
  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
    {label}
    <ChevronDown size={14} className="text-gray-400" />
  </button>
);

export default Dashboard;