"use client";

import React from 'react';
import { Panel } from '@xyflow/react';
import { Save, ChevronLeft } from 'lucide-react';

interface TopLeftPanelProps {
  onBack?: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const TopLeftPanel = ({ onBack, onSave, isSaving }: TopLeftPanelProps) => (
  <Panel position="top-left" className="m-4 flex items-center gap-3 pointer-events-none">
    <button 
      onClick={onBack}
      className="pointer-events-auto bg-white border border-gray-100 px-4 py-2.5 rounded-2xl text-xs font-black text-gray-500 hover:text-blue-600 shadow-xl shadow-gray-200/50 transition-all flex items-center gap-2 active:scale-95"
    >
      <ChevronLeft size={16} />
      Voltar
    </button>
    
    <div className="pointer-events-auto bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-xl shadow-gray-200/50 flex items-center gap-4">
      <span className="text-sm font-black text-gray-900 tracking-tight">Editor</span>
      <div className="w-px h-4 bg-gray-100" />
      <button 
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
      >
        <Save size={14} />
        {isSaving ? "Salvando..." : "Salvar Agora"}
      </button>
    </div>
  </Panel>
);