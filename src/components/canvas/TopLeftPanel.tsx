"use client";

import React from 'react';
import { Panel } from '@xyflow/react';
import { Save, Loader2, CloudCheck, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    
    <div className="pointer-events-auto bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-lg flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-gray-800">Editor</span>
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
          isSaving ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {isSaving ? (
            <>
              <Loader2 size={10} className="animate-spin" />
              <span>Salvando</span>
            </>
          ) : (
            <>
              <CloudCheck size={10} />
              <span>Salvo</span>
            </>
          )}
        </div>
      </div>

      <div className="w-px h-4 bg-gray-100" />
      
      <button 
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
      >
        <Save size={14} />
        Salvar Agora
      </button>
    </div>
  </Panel>
);