"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Home,
  LogOut,
  User,
  Plus,
  Settings,
  Search,
  Clock,
  Star,
  ChevronDown
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        fetchWorkspaces(user.id);
      }
    };
    getUser();
  }, []);

  const fetchWorkspaces = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (data) setWorkspaces(data);
    } catch (err) {
      console.error("Erro ao buscar workspaces:", err);
    }
  };

  const handleCreateWorkspace = async (name: string, color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, user_id: user.id, color }])
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(prev => [...prev, data]);
      setActiveWorkspaceId(data.id);
      setActiveView('dashboard');
      showSuccess("Workspace criado com sucesso!");
    } catch (error: any) {
      showError("Erro ao criar workspace.");
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm("Excluir este workspace excluirá todos os mapas dentro dele. Continuar?")) return;

    try {
      const { error } = await supabase.from('workspaces').delete().eq('id', id);
      if (error) throw error;

      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (activeWorkspaceId === id) setActiveWorkspaceId(undefined);
      showSuccess("Workspace removido");
    } catch (error: any) {
      showError("Erro ao excluir workspace");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Até logo!");
    navigate('/auth');
  };

  return (
    <>
      <div className={cn(
        "border-r bg-[#f9f9f9] h-screen flex flex-col transition-all duration-300 relative z-40",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Workspace Switcher */}
        <div className="p-3">
          <button 
            className={cn(
              "w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-200/50 transition-all text-left",
              isCollapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-black text-xs">BM</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">Boltz Map</p>
                <p className="text-[10px] font-bold text-gray-400 truncate">Workspace Pessoal</p>
              </div>
            )}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 mb-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisar por título..."
                className="w-full pl-9 pr-3 py-2 bg-gray-200/50 border-transparent rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
          <NavItem 
            icon={Home} 
            label="Início" 
            active={activeView === 'dashboard' && !activeWorkspaceId} 
            collapsed={isCollapsed}
            onClick={() => {
              setActiveView('dashboard');
              setActiveWorkspaceId(undefined);
            }}
          />
          <NavItem 
            icon={Clock} 
            label="Recente" 
            active={false} 
            collapsed={isCollapsed}
            onClick={() => {}}
          />
          <NavItem 
            icon={Star} 
            label="Favorito" 
            active={false} 
            collapsed={isCollapsed}
            onClick={() => {}}
          />

          <div className="mt-6 mb-2 px-3 flex items-center justify-between">
            {!isCollapsed && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Espaços</span>}
            {!isCollapsed && (
              <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors">
                <Plus size={14} />
              </button>
            )}
          </div>

          {workspaces.map((ws) => (
            <div key={ws.id} className="group relative">
              <button 
                onClick={() => {
                  setActiveWorkspaceId(ws.id);
                  setActiveView('dashboard');
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium w-full text-left",
                  activeWorkspaceId === ws.id ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200/50",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <div 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: ws.color || '#3b82f6' }} 
                />
                {!isCollapsed && <span className="truncate flex-1">{ws.name}</span>}
              </button>
              {!isCollapsed && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionMenu onDelete={() => handleDeleteWorkspace(ws.id)} label="Workspace" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-gray-200 p-2 space-y-1">
          <NavItem 
            icon={Sparkles} 
            label="Novidades" 
            active={activeView === 'updates'} 
            collapsed={isCollapsed}
            onClick={() => setActiveView('updates')}
            iconColor="text-amber-500"
          />
          <NavItem 
            icon={Settings} 
            label="Configurações" 
            active={activeView === 'settings'} 
            collapsed={isCollapsed}
            onClick={() => setActiveView('settings')}
          />
          
          <div className="pt-2">
            <button 
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium text-red-500 hover:bg-red-50 w-full",
                isCollapsed && "justify-center px-0"
              )}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 z-50 transition-transform hover:scale-110"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateWorkspace} 
      />
    </>
  );
};

const NavItem = ({ icon: Icon, label, active, collapsed, onClick, iconColor }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium w-full",
      active ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-200/50",
      collapsed && "justify-center px-0"
    )}
  >
    <Icon size={18} className={iconColor} />
    {!collapsed && <span>{label}</span>}
  </button>
);

export default WorkspaceSidebar;