"use client";

import React, { useState } from 'react';
import { Panel, useReactFlow, useStore } from '@xyflow/react';
import { Undo2, Redo2, Minus, Plus, Target, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShortcutsPlaybook } from '../modals/ShortcutsPlaybook';

interface BottomLeftPanelProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const BottomLeftPanel = ({ onUndo, onRedo, canUndo, canRedo }: BottomLeftPanelProps) => {
  const { zoomIn, zoomOut, fitView, getViewport, setViewport } = useReactFlow();
  const zoom = useStore((s) => s.transform[2]);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);

  const handleManualZoom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = parseInt(e.currentTarget.value);
      if (!isNaN(value)) {
        const newZoom = Math.min(Math.max(value / 100, 0.1), 4);
        const { x, y } = getViewport();
        setViewport({ x, y, zoom: newZoom }, { duration: 300 });
      }
    }
  };

  return (
    <Panel position="bottom-left" className="m-6 flex items-center gap-3">
      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-2xl">
        <div className="flex items-center border-r border-gray-100 pr-1.5">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            className={cn(
              "p-2 rounded-xl transition-all",
              !canUndo ? "text-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
            )}
          >
            <Undo2 size={18} />
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            className={cn(
              "p-2 rounded-xl transition-all",
              !canRedo ? "text-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
            )}
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => zoomOut()} className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl"><Minus size={18} /></button>
          <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
            <input 
              type="text"
              defaultValue={Math.round(zoom * 100)}
              key={Math.round(zoom * 100)}
              onKeyDown={handleManualZoom}
              className="w-8 bg-transparent text-[11px] font-bold text-gray-700 text-center outline-none"
            />
            <span className="text-[10px] font-bold text-gray-400">%</span>
          </div>
          <button onClick={() => zoomIn()} className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl"><Plus size={18} /></button>
        </div>

        <div className="pl-1.5 border-l border-gray-100">
          <button onClick={() => fitView({ duration: 800 })} className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl"><Target size={18} /></button>
        </div>
      </div>

      <button 
        onClick={() => setIsPlaybookOpen(true)}
        className="w-11 h-11 bg-white border border-gray-100 rounded-2xl shadow-2xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all"
      >
        <HelpCircle size={20} />
      </button>

      <ShortcutsPlaybook isOpen={isPlaybookOpen} onClose={() => setIsPlaybookOpen(false)} />
    </Panel>
  );
};