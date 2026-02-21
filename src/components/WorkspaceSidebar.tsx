"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Home,
  LogOut,
  Plus,
  Settings,
  Search,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Workspace } from '@/types/mindmap';
import { ActionMenu } from './ActionMenu';
import { CreateWorkspaceModal } from './modals/CreateWorkspaceModal';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeWorkspaceId?: string;
  setActiveWorkspaceId: (id: string | undefined) => void;
}

const WorkspaceSidebar = ({ activeView, setActiveView, activeWorkspaceId, setActiveWorkspaceId }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('workspaces').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
        if (data) setWorkspaces(data);
      }
    };
    fetchWorkspaces();
  }, []);

  const handleRenameWorkspace = async (id: string, oldName: string) => {
    const newName = prompt("Novo nome do workspace:", oldName);
    if (!newName || newName === oldName) return;
    try {
      const { error } = await supabase.from('workspaces').update({ name: newName }).eq('id', id);
      if (error) throw error;
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
      showSuccess("Workspace renomeado");
    } catch (error) {
      showError("Erro ao renomear");
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm("Excluir este workspace?")) return;
    try {
      const { error } = await supabase.from('workspaces').delete().eq('id', id);
      if (error) throw error;
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (activeWorkspaceId === id) setActiveWorkspaceId(undefined);
      showSuccess("Workspace removido");
    } catch (error) {
      showError("Erro ao excluir");
    }
  };

  const filteredWorkspaces = workspaces.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className={cn("border-r bg-[#f9f9f9] h-screen flex flex-col transition-all duration-300 relative z-40", isCollapsed ? "w-16" : "w-64")}>
        <div className="p-3">
          <button className={cn("w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-200/50 transition-all", isCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm"><span className="text-white font-black text-xs">BM</span></div>
            {!isCollapsed && <div className="flex-1 min-w-0"><p className="text-xs font-black text-gray-900 truncate uppercase">Boltz Map</p></div>}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-4 mb-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Filtrar espaços..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-200/50 border-transparent rounded-lg text-xs font-medium focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
          <NavItem icon={Home} label="Início" active={activeView === 'dashboard' && !activeWorkspaceId} collapsed={isCollapsed} onClick={() => { setActiveView('dashboard'); setActiveWorkspaceId(undefined); }} />
          <NavItem icon={Clock} label="Recente" active={activeView === 'recent'} collapsed={isCollapsed} onClick={() => { setActiveView('recent'); setActiveWorkspaceId(undefined); }} />
          <NavItem icon={Star} label="Favorito" active={activeView === 'favorites'} collapsed={isCollapsed} onClick={() => { setActiveView('favorites'); setActiveWorkspaceId(undefined); }} />

          <div className="mt-6 mb-2 px-3 flex items-center justify-between">
            {!isCollapsed && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Espaços</span>}
            {!isCollapsed && <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Plus size={14} /></button>}
          </div>

          {filteredWorkspaces.map((ws) => (
            <div key={ws.id} className="group relative">
              <button 
                onClick={() => { setActiveWorkspaceId(ws.id); setActiveView('dashboard'); }}
                className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium w-full text-left", activeWorkspaceId === ws.id ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200/50", isCollapsed && "justify-center px-0")}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ws.color || '#3b82f6' }} />
                {!isCollapsed && <span className="truncate flex-1">{ws.name}</span>}
              </button>
              {!isCollapsed && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionMenu 
                    onDelete={() => handleDeleteWorkspace(ws.id)} 
                    onRename={() => handleRenameWorkspace(ws.id, ws.name)}
                    label="Workspace" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-gray-200 p-2 space-y-1">
          <NavItem icon={Sparkles} label="Novidades" active={activeView === 'updates'} collapsed={isCollapsed} onClick={() => setActiveView('updates')} iconColor="text-amber-500" />
          <NavItem icon={Settings} label="Configurações" active={activeView === 'settings'} collapsed={isCollapsed} onClick={() => setActiveView('settings')} />
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/auth'); }} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full", isCollapsed && "justify-center px-0")}><LogOut size={18} />{!isCollapsed && <span>Sair</span>}</button>
        </div>

        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:scale-110 transition-all z-50">{isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}</button>
      </div>

      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={async (n, c) => { const { data: { user } } = await supabase.auth.getUser(); const { data } = await supabase.from('workspaces').insert([{ name: n, color: c, user_id: user?.id }]).select().single(); if (data) setWorkspaces([...workspaces, data]); }} />
    </>
  );
};

const NavItem = ({ icon: Icon, label, active, collapsed, onClick, iconColor }: any) => (
  <button onClick={onClick} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium w-full", active ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200/50", collapsed && "justify-center px-0")}>
    <Icon size={18} className={iconColor} />
    {!collapsed && <span>{label}</span>}
  </button>
);

export default WorkspaceSidebar;