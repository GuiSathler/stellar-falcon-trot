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
  Trash2,
  Maximize2,
  MoveHorizontal
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

  const handleCurvatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
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
        labelStyle: { fill: '#1e293b', fontWeight: 800, fontSize: 12 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 1 },
        labelBgPadding: [10, 6],
        labelBgBorderRadius: 12,
      });
    }
  };

  return (
    <div className="flex items-center bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[24px] p-2 gap-2 animate-in fade-in zoom-in duration-300 pointer-events-auto">
      {/* Tipo de Ponta */}
      <button 
        onClick={toggleMarker}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 rounded-2xl transition-all text-xs font-black uppercase tracking-wider",
          edge.markerEnd ? "text-blue-600 bg-blue-50" : "text-gray-500"
        )}
      >
        <ArrowRight size={16} />
        <span>{edge.markerEnd ? "Com Seta" : "Sem Seta"}</span>
      </button>

      <div className="w-px h-8 bg-gray-100 mx-1" />

      {/* Tipo de Linha */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onUpdate(edge.id, { type: 'default' })}
          className={cn("p-3 rounded-2xl transition-all", edge.type === 'default' || !edge.type ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-gray-50")}
          title="Curva Bézier (Photoshop)"
        >
          <Spline size={18} />
        </button>
        <button 
          onClick={() => onUpdate(edge.id, { type: 'straight' })}
          className={cn("p-3 rounded-2xl transition-all", edge.type === 'straight' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-gray-50")}
          title="Linha Reta"
        >
          <Minus size={18} />
        </button>
        <button 
          onClick={() => onUpdate(edge.id, { type: 'smoothstep' })}
          className={cn("p-3 rounded-2xl transition-all", edge.type === 'smoothstep' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-gray-50")}
          title="Degrau Suave"
        >
          <Activity size={18} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-100 mx-1" />

      {/* Controle de Curvatura de Precisão */}
      <div className="flex flex-col gap-1 px-3 min-w-[120px]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ângulo de Curva</span>
          <span className="text-[9px] font-black text-blue-600">{currentCurvature}px</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={currentCurvature}
          onChange={handleCurvatureChange}
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="w-px h-8 bg-gray-100 mx-1" />

      {/* Cores */}
      <div className="flex items-center gap-1.5 px-1">
        {COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => {
              updateStyle({ stroke: c.value, strokeWidth: 3 });
              if (edge.markerEnd) {
                onUpdate(edge.id, { markerEnd: { ...edge.markerEnd as any, color: c.value } });
              }
            }}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all hover:scale-125",
              currentStroke === c.value ? "border-blue-400 scale-110 shadow-md" : "border-transparent"
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="w-px h-8 bg-gray-100 mx-1" />

      {/* Texto */}
      <button 
        onClick={handleSetLabel}
        className={cn(
          "p-3 rounded-2xl transition-all flex items-center gap-2",
          edge.label ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
        )}
      >
        <Type size={18} />
        {edge.label && <span className="text-[10px] font-black uppercase">Editar</span>}
      </button>

      <div className="w-px h-8 bg-gray-100 mx-1" />

      {/* Excluir */}
      <button 
        onClick={() => onDelete(edge.id)}
        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        title="Excluir Conexão"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};