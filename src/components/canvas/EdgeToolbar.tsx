"use client";

import React from 'react';
import { Edge, MarkerType } from '@xyflow/react';
import { 
  Type, 
  ChevronDown, 
  Lock, 
  Sparkles, 
  MoreVertical, 
  ArrowRight,
  Minus,
  Plus,
  Spline,
  Square,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EdgeToolbarProps {
  edge: Edge;
  onUpdate: (id: string, data: Partial<Edge>) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  { name: 'Gray', value: '#94a3b8' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#ef4444' },
  { name: 'Amber', value: '#f59e0b' },
];

export const EdgeToolbar = ({ edge, onUpdate, onDelete }: EdgeToolbarProps) => {
  const currentStroke = (edge.style?.stroke as string) || '#94a3b8';
  const currentWidth = (edge.style?.strokeWidth as number) || 2;
  const currentFontSize = (edge.labelStyle?.fontSize as number) || 12;

  const updateStyle = (updates: any) => {
    onUpdate(edge.id, {
      style: { ...edge.style, ...updates }
    });
  };

  const toggleMarker = () => {
    const hasMarker = !!edge.markerEnd;
    onUpdate(edge.id, {
      markerEnd: hasMarker ? undefined : { type: MarkerType.ArrowClosed, color: currentStroke }
    });
  };

  const changeType = (type: string) => {
    onUpdate(edge.id, { type });
  };

  return (
    <div className="flex items-center bg-white border border-gray-100 shadow-2xl rounded-2xl p-1.5 gap-1 animate-in fade-in zoom-in duration-200 pointer-events-auto">
      {/* Tipo de Ponta */}
      <button 
        onClick={toggleMarker}
        className={cn(
          "flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all text-xs font-bold",
          edge.markerEnd ? "text-blue-600" : "text-gray-500"
        )}
      >
        <span>{edge.markerEnd ? "Seta" : "Nenhum"}</span>
        <ArrowRight size={14} />
      </button>

      <div className="w-px h-6 bg-gray-100 mx-1" />

      {/* Tipo de Linha */}
      <div className="flex items-center gap-0.5">
        <button 
          onClick={() => changeType('smoothstep')}
          className={cn("p-2 rounded-xl transition-all", edge.type === 'smoothstep' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
          title="Suave"
        >
          <Spline size={16} />
        </button>
        <button 
          onClick={() => changeType('straight')}
          className={cn("p-2 rounded-xl transition-all", edge.type === 'straight' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
          title="Reta"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={() => changeType('step')}
          className={cn("p-2 rounded-xl transition-all", edge.type === 'step' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
          title="Degrau"
        >
          <Activity size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-100 mx-1" />

      {/* Cor */}
      <div className="flex items-center gap-1 px-1">
        {COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => {
              updateStyle({ stroke: c.value });
              if (edge.markerEnd) {
                onUpdate(edge.id, { markerEnd: { ...edge.markerEnd as any, color: c.value } });
              }
            }}
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-all hover:scale-110",
              currentStroke === c.value ? "border-blue-200 scale-110 shadow-sm" : "border-transparent"
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-gray-100 mx-1" />

      {/* Texto e Fonte */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => {
            const newLabel = prompt("Texto da conexão:", (edge.label as string) || "");
            if (newLabel !== null) onUpdate(edge.id, { label: newLabel });
          }}
          className={cn("p-2 rounded-xl transition-all", edge.label ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
        >
          <Type size={16} />
        </button>
        
        <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
          <span className="text-[10px] font-black text-gray-500 mr-2">{currentFontSize}</span>
          <div className="flex flex-col gap-0.5">
            <button onClick={() => onUpdate(edge.id, { labelStyle: { fontSize: currentFontSize + 1 } })} className="hover:text-blue-600"><Plus size={8} /></button>
            <button onClick={() => onUpdate(edge.id, { labelStyle: { fontSize: Math.max(8, currentFontSize - 1) } })} className="hover:text-blue-600"><Minus size={8} /></button>
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-gray-100 mx-1" />

      {/* Ações Extras */}
      <div className="flex items-center gap-0.5">
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><Lock size={16} /></button>
        <button className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl"><Sparkles size={16} /></button>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><MoreVertical size={16} /></button>
      </div>
    </div>
  );
};