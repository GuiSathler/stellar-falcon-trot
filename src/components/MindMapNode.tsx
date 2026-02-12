"use client";

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Plus, Trash2, Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  { name: 'Blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-100' },
  { name: 'Emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-100' },
  { name: 'Amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-100' },
  { name: 'Rose', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', ring: 'ring-rose-100' },
  { name: 'Purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-100' },
];

const MindMapNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [label, setLabel] = useState(data.label as string);

  const currentColor = COLORS.find(c => c.name === data.color) || COLORS[0];

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

  const changeColor = (colorName: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, color: colorName } };
        }
        return node;
      })
    );
    setShowColors(false);
  };

  return (
    <div 
      className={cn(
        "group px-5 py-4 shadow-xl rounded-2xl border-2 transition-all duration-500 min-w-[180px] animate-in zoom-in-95",
        currentColor.bg,
        currentColor.border,
        selected ? `ring-8 ${currentColor.ring} scale-105 z-50` : "hover:scale-102"
      )}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-current border-2 border-white" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <input
              autoFocus
              className="text-sm font-bold outline-none w-full bg-white/50 rounded-lg px-2 py-1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            />
          ) : (
            <span 
              onDoubleClick={() => setIsEditing(true)}
              className={cn("text-sm font-bold cursor-text truncate", currentColor.text)}
            >
              {label}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <div className="flex gap-1">
            <button 
              onClick={() => setShowColors(!showColors)}
              className="p-1.5 hover:bg-white/80 rounded-lg transition-colors text-gray-500"
            >
              <Palette size={14} />
            </button>
            <button 
              onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
              className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof data.onAddChild === 'function') data.onAddChild();
            }}
            className="bg-white text-blue-600 rounded-xl p-1.5 hover:shadow-lg hover:scale-110 transition-all border border-blue-100"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>

        {showColors && (
          <div className="absolute -bottom-12 left-0 flex gap-1 bg-white p-1.5 rounded-xl shadow-2xl border border-gray-100 z-[100] animate-in slide-in-from-top-2">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => changeColor(c.name)}
                className={cn("w-6 h-6 rounded-full border-2", c.bg, c.border)}
              />
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-current border-2 border-white" />
    </div>
  );
};

export default memo(MindMapNode);