"use client";

import React from 'react';
import { Folder, FileText, ChevronRight, Plus, Settings, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const WorkspaceSidebar = () => {
  return (
    <div className="w-64 border-r bg-gray-50/50 h-screen flex flex-col p-4 gap-6">
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <LayoutGrid className="text-white" size={18} />
        </div>
        <h1 className="font-bold text-lg tracking-tight">Boltz Flow</h1>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Workspace</p>
        <button className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-md shadow-sm border border-gray-200">
          <Folder size={16} className="text-blue-500" />
          <span>Projetos 2024</span>
          <ChevronRight size={14} className="ml-auto text-gray-400" />
        </button>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mapas Recentes</p>
          <Plus size={14} className="text-gray-400 cursor-pointer hover:text-blue-600" />
        </div>
        
        {['Estratégia de Produto', 'Arquitetura Boltz', 'User Journey'].map((map) => (
          <button key={map} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-left">
            <FileText size={16} className="text-gray-400" />
            <span className="truncate">{map}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto border-t pt-4">
        <button className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md w-full transition-colors">
          <Settings size={16} />
          <span>Configurações</span>
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSidebar;