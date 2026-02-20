"use client";

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  Plus, 
  Settings, 
  LayoutGrid, 
  ChevronLeft,
  Sparkles,
  Home,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const WorkspaceSidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Até logo!");
    navigate('/auth');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'workspace', label: 'Workspace', icon: Folder },
  ];

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

      <div className="flex flex-col gap-1 px-2">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium",
              activeView === item.id ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100",
              isCollapsed && "justify-center px-0"
            )}
          >
            <item.icon size={18} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
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