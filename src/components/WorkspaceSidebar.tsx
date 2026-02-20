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
  Briefcase,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Workspace } from '@/types/mindmap';
import { ActionMenu } from './ActionMenu';

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
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (data) setWorkspaces(data);
  };

  const handleCreateWorkspace = async () => {
    const name = prompt("Nome do novo Workspace:");
    if (!name) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('workspaces')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (error) {
      showError("Erro ao criar workspace");
    } else {
      setWorkspaces([...workspaces, data]);
      showSuccess("Workspace criado!");
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm("Excluir este workspace excluirá todos os mapas dentro dele. Continuar?")) return;

    const { error } = await supabase.from('workspaces').delete().eq('id', id);
    if (error) {
      showError("Erro ao excluir workspace");
    } else {
      setWorkspaces(workspaces.filter(w => w.id !== id));
      if (activeWorkspaceId === id) setActiveWorkspaceId(undefined);
      showSuccess("Workspace removido");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Até logo!");
    navigate('/auth');
  };

  return (
    <div className={cn(
      "border-r bg-gray-50/50 h-screen flex flex-col transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={cn("flex items-center gap-2 p-4 mb-4", isCollapsed && "justify-center")}>
        <div className="min-w-[32px] h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <LayoutGrid className="text-white" size={18} />
        </div>
        {!isCollapsed && <h1 className="font-bold text-lg tracking-tight truncate">Boltz Flow</h1>}
      </div>

      <div className="flex flex-col gap-1 px-2 overflow-y-auto flex-1">
        <button 
          onClick={() => {
            setActiveView('dashboard');
            setActiveWorkspaceId(undefined);
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium",
            activeView === 'dashboard' && !activeWorkspaceId ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Home size={18} />
          {!isCollapsed && <span>Início</span>}
        </button>

        <div className="mt-4 mb-2 px-3 flex items-center justify-between">
          {!isCollapsed && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workspaces</span>}
          {!isCollapsed && (
            <button onClick={handleCreateWorkspace} className="p-1 hover:bg-gray-200 rounded text-gray-500">
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
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium w-full text-left",
                activeWorkspaceId === ws.id ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Briefcase size={18} />
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

      <div className="mt-auto border-t p-2 space-y-1">
        {!isCollapsed && userEmail && (
          <div className="px-3 py-2 mb-2 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Usuário</p>
              <p className="text-xs font-bold text-gray-700 truncate">{userEmail}</p>
            </div>
          </div>
        )}

        <button 
          onClick={() => setActiveView('updates')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium w-full",
            activeView === 'updates' ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Sparkles size={18} className={activeView === 'updates' ? "text-blue-600" : "text-amber-500"} />
          {!isCollapsed && <span>Novidades</span>}
        </button>
        
        <button 
          onClick={() => setActiveView('settings')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium w-full",
            activeView === 'settings' ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings size={18} />
          {!isCollapsed && <span>Configurações</span>}
        </button>

        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium text-red-500 hover:bg-red-50 w-full",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSidebar;