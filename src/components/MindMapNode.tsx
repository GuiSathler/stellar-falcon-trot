"use client";

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Plus, Trash2, Lightbulb, CheckCircle2, HelpCircle, AlertCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const NODE_TYPES = [
  { id: 'idea', icon: Lightbulb, color: 'text-amber-500', label: 'Ideia' },
  { id: 'task', icon: CheckCircle2, color: 'text-emerald-500', label: 'Tarefa' },
  { id: 'question', icon: HelpCircle, color: 'text-blue-500', label: 'Dúvida' },
  { id: 'alert', icon: AlertCircle, color: 'text-rose-500', label: 'Alerta' },
];

const MindMapNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [label, setLabel] = useState(data.label as string);

  const currentType = NODE_TYPES.find(t => t.id === data.nodeType) || NODE_TYPES[0];
  const Icon = currentType.icon;

  const handleBlur = () => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label } };
        }
        return node;
      })
    );
  };

  const changeType = (typeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, nodeType: typeId } };
        }
        return node;
      })
    );
    setShowTypePicker(false);
  };

  return (
    <div 
      className={cn(
        "group relative bg-white border-2 transition-all duration-300 ease-in-out",
        "rounded-2xl px-4 py-3 min-w-[200px]",
        selected 
          ? "border-blue-500 shadow-2xl shadow-blue-100 scale-105 z-50" 
          : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
      )}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-white !border-2 !border-blue-400 !-left-1.5" 
      />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowTypePicker(!showTypePicker)}
            className={cn("p-1 rounded-lg hover:bg-gray-50 transition-colors", currentType.color)}
          >
            <Icon size={16} />
          </button>
          
          {isEditing ? (
            <input
              autoFocus
              className="text-sm font-semibold text-gray-800 outline-none w-full bg-gray-50/50 rounded px-1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            />
          ) : (
            <span 
              onDoubleClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-gray-700 cursor-text truncate select-none flex-1"
            >
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Menu de Tipos */}
      {showTypePicker && (
        <div className="absolute -bottom-14 left-0 flex gap-1 bg-white p-1.5 rounded-xl shadow-2xl border border-gray-100 z-[100] animate-in slide-in-from-top-2">
          {NODE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => changeType(type.id)}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-50 transition-colors",
                type.color
              )}
              title={type.label}
            >
              <type.icon size={16} />
            </button>
          ))}
        </div>
      )}

      {/* Ações Rápidas */}
      <div className={cn(
        "absolute -right-2 -top-2 flex gap-1 transition-all duration-200",
        selected || "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
      )}>
        <button 
          onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
          className="p-1.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 size={12} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (typeof data.onAddChild === 'function') data.onAddChild();
          }}
          className="p-1.5 bg-blue-600 rounded-xl shadow-lg text-white hover:bg-blue-700 hover:scale-110 transition-all"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-white !border-2 !border-blue-400 !-right-1.5" 
      />
    </div>
  );
};

export default memo(MindMapNode);