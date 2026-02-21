"use client";

import React from 'react';
import { Edge, MarkerType } from '@xyflow/react';
import { 
  Type, 
  ArrowRight,
  Minus,
  Plus,
  Spline,
  Activity,
  RotateCcw,
  Trash2
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
  
  // Curvatura depende do tipo de linha
  const currentCurvature = edge.type === 'smoothstep' 
    ? (edge.pathOptions?.borderRadius || 20) 
    : (edge.pathOptions?.curvature || 20);

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

  const changeCurvature = (delta: number) => {
    const newValue = Math.max(0, currentCurvature + delta);
    onUpdate(edge.id, {
      pathOptions: edge.type === 'smoothstep' 
        ? { borderRadius: newValue } 
        : { curvature: newValue }
    });
  };

  const handleSetLabel = () => {
    const newLabel = prompt("Texto da conexão:", (edge.label as string) || "");
    if (newLabel !== null) {
      onUpdate(edge.id, { 
        label: newLabel,
        // Estilização da "caixa" de texto no meio da linha
        labelStyle: { 
          fill: '#1e293b', 
          fontWeight: 700, 
          fontSize: 12 
        },
        labelBgStyle: { 
          fill: '#ffffff', 
          fillOpacity: 1 
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 8,
      });
    }
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
          onClick={() => onUpdate(edge.id, { type: 'smoothstep' })}
          className={cn("p-2 rounded-xl transition-all", edge.type === 'smoothstep' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
          title="Curva Suave"
        >
          <Spline size={16} />
        </button>
        <button 
          onClick={() => onUpdate(edge.id, { type: 'straight' })}
          className={cn("p-2 rounded-xl transition-all", edge.type === 'straight' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
          title="Linha Reta"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={() => onUpdate(edge.id, { type: 'step' })}
          className={cn("p-2 rounded-xl transition-all", edge.type === 'step' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
          title="Degrau"
        >
          <Activity size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-100 mx-1" />

      {/* Controle de Curvatura */}
      <div className="flex items-center gap-1 px-1">
        <span className="text-[10px] font-black text-gray-400 uppercase mr-1">Curva</span>
        <button onClick={() => changeCurvature(-5)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500"><Minus size={14} /></button>
        <div className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 min-w-[30px] text-center">
          <span className="text-[10px] font-black text-gray-700">{currentCurvature}</span>
        </div>
        <button onClick={() => changeCurvature(5)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500"><Plus size={14} /></button>
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

      {/* Texto (Label) */}
      <button 
        onClick={handleSetLabel}
        className={cn(
          "p-2 rounded-xl transition-all flex items-center gap-2",
          edge.label ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
        )}
      >
        <Type size={16} />
        {edge.label && <span className="text-[10px] font-bold">Editar</span>}
      </button>

      <div className="w-px h-6 bg-gray-100 mx-1" />

      {/* Excluir */}
      <button 
        onClick={() => onDelete(edge.id)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        title="Excluir Conexão"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};