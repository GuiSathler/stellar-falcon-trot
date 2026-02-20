"use client";

import React from 'react';
import { Panel } from '@xyflow/react';
import { Save, Loader2 } from 'lucide-react';

interface TopLeftPanelProps {
  onBack?: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const TopLeftPanel = ({ onBack, onSave, isSaving }: TopLeftPanelProps) => (
  <Panel position="top-left" className="m-4 flex items-center gap-4 pointer-events-none">
    <button 
      onClick={onBack}
      className="pointer-events-auto bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-blue-600 shadow-lg transition-all"
    >
      Voltar
    </button>
    <div className="pointer-events-auto bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3">
      <span className="text-sm font-black text-gray-800">Editor</span>
      <div className="w-px h-4 bg-gray-100" />
      <button 
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {isSaving ? "Salvando..." : "Salvar Agora"}
      </button>
    </div>
  </Panel>
);