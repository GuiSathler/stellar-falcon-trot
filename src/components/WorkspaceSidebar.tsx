"use client";

import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  Plus, 
  Settings, 
  LayoutGrid, 
  ChevronLeft,
  Sparkles,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const WorkspaceSidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'workspace', label: 'Workspace', icon: Folder },
  ];

  const recentMaps = ['Estratégia de Produto', 'Arquitetura Boltz', 'User Journey'];

  return (
    <div className={cn(
      "border-r bg-gray-50/50 h-screen flex flex-col transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={cn("flex items-center gap-2 p-4 mb-4", isCollapsed && "justify-center")}>
        <div className="min-w-[32px] h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <LayoutGrid className="text-white" size={18} />
        </div>
        {!isCollapsed && <h1 className="font-bold text-lg tracking-tight truncate">Boltz Flow</h1>}
      </div>

      {/* Main Navigation */}
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

      {/* Recent Maps Section */}
      {!isCollapsed && (
        <div className="mt-8 flex flex-col gap-1 px-2 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recentes</p>
            <Plus size={14} className="text-gray-400 cursor-pointer hover:text-blue-600" />
          </div>
          {recentMaps.map((map) => (
            <button 
              key={map} 
              onClick={() => setActiveView('editor')}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-left"
            >
              <FileText size={16} className="text-gray-400" />
              <span className="truncate">{map}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-auto border-t p-2 space-y-1">
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
        
        <button className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium text-gray-600 hover:bg-gray-100 w-full",
          isCollapsed && "justify-center px-0"
        )}>
          <Settings size={18} />
          {!isCollapsed && <span>Configurações</span>}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSidebar;