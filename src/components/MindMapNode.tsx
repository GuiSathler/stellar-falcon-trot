"use client";

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Plus, Trash2, MoreHorizontal, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

const MindMapNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label as string);

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

  return (
    <div 
      className={cn(
        "group relative bg-white border transition-all duration-300 ease-out",
        "rounded-xl px-4 py-3 min-w-[160px]",
        selected 
          ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1)]" 
          : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
      )}
    >
      {/* Handles minimalistas */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2 !h-2 !bg-gray-300 !border-none hover:!bg-blue-400 transition-colors" 
      />
      
      <div className="flex flex-col gap-1">
        {isEditing ? (
          <input
            autoFocus
            className="text-sm font-medium text-gray-800 outline-none w-full bg-transparent"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span 
              onDoubleClick={() => setIsEditing(true)}
              className="text-sm font-medium text-gray-700 cursor-text truncate select-none"
            >
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Menu de Ações Rápido (Aparece no Hover ou Seleção) */}
      <div className={cn(
        "absolute -right-2 -top-2 flex gap-1 transition-all duration-200",
        selected || "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
      )}>
        <button 
          onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
          className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm text-gray-400 hover:text-red-500 hover:border-red-100 transition-all"
        >
          <Trash2 size={12} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (typeof data.onAddChild === 'function') data.onAddChild();
          }}
          className="p-1.5 bg-blue-600 rounded-lg shadow-lg text-white hover:bg-blue-700 hover:scale-110 transition-all"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2 !h-2 !bg-gray-300 !border-none hover:!bg-blue-400 transition-colors" 
      />
    </div>
  );
};

export default memo(MindMapNode);