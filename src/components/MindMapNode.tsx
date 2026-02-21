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
          "relative transition-all duration-500 min-w-[180px] max-w-[320px]",
          "rounded-[28px] border-4 bg-white p-6 text-center shadow-2xl",
          selected 
            ? "border-[#29A858] ring-[12px] ring-[#29A858]/10 scale-110 z-50" 
            : "border-[#110935]/5 hover:border-[#29A858]/30"
        )}
        style={{ borderColor: selected ? undefined : data.color }}
      >
        <Handle type="target" position={Position.Left} className="opacity-0" />
        
        <div className="flex flex-col items-center justify-center min-h-[32px]">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent outline-none resize-none overflow-hidden font-black text-lg text-[#110935] text-center leading-tight placeholder:text-[#110935]/20"
              value={label}
              placeholder="Type something..."
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
              className="whitespace-pre-wrap break-words font-black text-lg text-[#110935] cursor-text leading-tight tracking-tight"
            >
              {label || "New Topic"}
            </div>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChild?.();
          }}
          className={cn(
            "absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#29A858] text-[#110935] rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all z-10 border-4 border-white",
            !selected && "opacity-0 group-hover:opacity-100"
          )}
        >
          <Plus size={20} strokeWidth={4} />
        </button>

        <Handle type="source" position={Position.Right} className="opacity-0" />
      </div>
    </div>
  );
};

export default memo(MindMapNode);