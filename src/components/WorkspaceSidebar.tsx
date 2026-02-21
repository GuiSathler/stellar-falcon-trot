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

  const filteredWorkspaces = workspaces.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className={cn(
        "bg-[#110935] h-screen flex flex-col transition-all duration-500 relative z-40 border-r border-white/5",
        isCollapsed ? "w-20" : "w-72"
      )}>
        <div className="p-6">
          <button className={cn("w-full flex items-center gap-3 p-2 rounded-2xl transition-all", isCollapsed && "justify-center")}>
            <div className="w-10 h-10 bg-[#29A858] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#29A858]/20">
              <LayoutGrid className="text-[#110935]" size={20} strokeWidth={3} />
            </div>
            {!isCollapsed && <span className="text-xl font-black text-white tracking-tighter">boltz.</span>}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-6 mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#79F791] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border-transparent rounded-2xl text-sm font-bold text-white placeholder:text-white/20 focus:bg-white/10 outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 px-4 flex-1 overflow-y-auto">
          <NavItem icon={Home} label="Dashboard" active={activeView === 'dashboard' && !activeWorkspaceId} collapsed={isCollapsed} onClick={() => { setActiveView('dashboard'); setActiveWorkspaceId(undefined); }} />
          <NavItem icon={Clock} label="Recent" active={activeView === 'recent'} collapsed={isCollapsed} onClick={() => { setActiveView('recent'); setActiveWorkspaceId(undefined); }} />
          <NavItem icon={Star} label="Favorites" active={activeView === 'favorites'} collapsed={isCollapsed} onClick={() => { setActiveView('favorites'); setActiveWorkspaceId(undefined); }} />

          <div className="mt-10 mb-4 px-4 flex items-center justify-between">
            {!isCollapsed && <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Workspaces</span>}
            {!isCollapsed && (
              <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-white/5 rounded-lg text-[#79F791] transition-colors">
                <Plus size={16} strokeWidth={3} />
              </button>
            )}
          </div>

          {filteredWorkspaces.map((ws) => (
            <div key={ws.id} className="group relative">
              <button 
                onClick={() => { setActiveWorkspaceId(ws.id); setActiveView('dashboard'); }}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-sm font-bold w-full text-left",
                  activeWorkspaceId === ws.id 
                    ? "bg-[#29A858] text-[#110935] shadow-xl shadow-[#29A858]/10" 
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  activeWorkspaceId === ws.id ? "bg-[#110935]" : ""
                )} style={{ backgroundColor: activeWorkspaceId === ws.id ? undefined : ws.color }} />
                {!isCollapsed && <span className="truncate flex-1">{ws.name}</span>}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto p-4 space-y-2">
          <NavItem icon={Sparkles} label="What's New" active={activeView === 'updates'} collapsed={isCollapsed} onClick={() => setActiveView('updates')} iconColor="text-[#AC7FFF]" />
          <NavItem icon={Settings} label="Settings" active={activeView === 'settings'} collapsed={isCollapsed} onClick={() => setActiveView('settings')} />
          <button 
            onClick={async () => { await supabase.auth.signOut(); navigate('/auth'); }} 
            className={cn(
              "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 w-full transition-all",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut size={20} strokeWidth={2.5} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#29A858] text-[#110935] rounded-full p-2 shadow-2xl hover:scale-110 transition-all z-50 border-4 border-[#110935]"
        >
          {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>
      </div>

      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={async (n, c) => { const { data: { user } } = await supabase.auth.getUser(); const { data } = await supabase.from('workspaces').insert([{ name: n, color: c, user_id: user?.id }]).select().single(); if (data) setWorkspaces([...workspaces, data]); }} />
    </>
  );
};

const NavItem = ({ icon: Icon, label, active, collapsed, onClick, iconColor }: any) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold w-full",
      active 
        ? "bg-white/10 text-[#79F791] shadow-sm" 
        : "text-white/40 hover:bg-white/5 hover:text-white",
      collapsed && "justify-center px-0"
    )}
  >
    <Icon size={20} className={cn(iconColor || (active ? "text-[#79F791]" : ""))} strokeWidth={2.5} />
    {!collapsed && <span>{label}</span>}
  </button>
);

export default WorkspaceSidebar;