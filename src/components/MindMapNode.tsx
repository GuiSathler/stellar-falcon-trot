"use client";

import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MindMapNodeData = {
  label: string;
  onAddChild?: () => void;
  onSave?: () => void;
  isNew?: boolean;
  color?: string;
};

const MindMapNode = ({ id, data, selected }: NodeProps<Node<MindMapNodeData>>) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [label, setLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          "relative transition-all duration-300 min-w-[160px] max-w-[300px]",
          "rounded-2xl border-2 bg-white p-4 text-center shadow-sm",
          selected ? "border-blue-500 ring-4 ring-blue-50 scale-105" : "border-gray-200 hover:border-blue-300"
        )}
        style={{ borderColor: data.color || undefined }}
      >
        <Handle type="target" position={Position.Left} className="opacity-0" />
        
        <div className="flex flex-col items-center justify-center min-h-[24px]">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent outline-none resize-none overflow-hidden font-bold text-sm text-gray-800 text-center leading-tight"
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
              className="whitespace-pre-wrap break-words font-bold text-sm text-gray-800 cursor-text leading-tight"
            >
              {label || "Tópico"}
            </div>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChild?.();
          }}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-10",
            !selected && "opacity-0 group-hover:opacity-100"
          )}
        >
          <Plus size={14} strokeWidth={3} />
        </button>

        <Handle type="source" position={Position.Right} className="opacity-0" />
      </div>
    </div>
  );
};

export default memo(MindMapNode);