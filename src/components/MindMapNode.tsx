"use client";

import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { Plus, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MindMapNodeData = {
  label: string;
  onAddChild?: () => void;
  onSave?: () => void;
  isNew?: boolean;
  color?: string;
  depth?: number;
  isHighlighted?: boolean;
};

const MindMapNode = ({ id, data, selected }: NodeProps<Node<MindMapNodeData>>) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [label, setLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cores baseadas na profundidade (Hierarquia)
  const getHierarchyStyles = () => {
    const depth = data.depth || 0;
    const colors = [
      { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', shadow: 'shadow-blue-100' }, // Raiz
      { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', shadow: 'shadow-blue-50' },  // Nível 1
      { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', shadow: 'shadow-emerald-50' }, // Nível 2
      { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', shadow: 'shadow-amber-50' }, // Nível 3
      { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', shadow: 'shadow-rose-50' }, // Nível 4
    ];
    return colors[Math.min(depth, colors.length - 1)];
  };

  const styles = getHierarchyStyles();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const trimmedLabel = label.trim();
    
    if (!trimmedLabel && data.isNew) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { 
            ...node, 
            data: { ...node.data, label: trimmedLabel, isNew: false } 
          };
        }
        return node;
      })
    );

    if (data.onSave) {
      setTimeout(data.onSave, 100);
    }
  };

  return (
    <div className="relative group">
      <div 
        className={cn(
          "relative transition-all duration-300 min-w-[180px] max-w-[320px]",
          "rounded-[24px] border-2 p-5 text-center shadow-sm",
          styles.bg, styles.border, styles.shadow,
          selected ? "ring-8 ring-blue-500/10 scale-105 z-50" : "hover:scale-[1.02]",
          data.isHighlighted && "ring-4 ring-blue-400/30 border-blue-400"
        )}
      >
        <Handle type="target" position={Position.Left} className="opacity-0 w-0 h-0" />
        
        <div className="flex flex-col items-center justify-center min-h-[28px]">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className={cn(
                "w-full bg-transparent outline-none resize-none overflow-hidden font-black text-sm text-center leading-tight",
                styles.text
              )}
              value={label}
              rows={label.split('\n').length || 1}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleBlur();
                }
              }}
            />
          ) : (
            <div 
              onDoubleClick={() => setIsEditing(true)}
              className={cn(
                "whitespace-pre-wrap break-words font-black text-sm cursor-text leading-tight",
                styles.text
              )}
            >
              {label || "Tópico"}
            </div>
          )}
        </div>

        {/* Botão de Adição Rápida */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChild?.();
          }}
          className={cn(
            "absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center shadow-xl hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-90 transition-all z-10",
            !selected && "opacity-0 group-hover:opacity-100"
          )}
        >
          <Plus size={18} strokeWidth={3} />
        </button>

        {/* Indicador de Edição */}
        {!isEditing && selected && (
          <div className="absolute -top-3 -right-3 bg-white p-1.5 rounded-lg shadow-md border border-gray-100 text-gray-400">
            <Edit3 size={12} />
          </div>
        )}

        <Handle type="source" position={Position.Right} className="opacity-0 w-0 h-0" />
      </div>
    </div>
  );
};

export default memo(MindMapNode);