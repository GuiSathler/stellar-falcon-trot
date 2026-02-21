"use client";

import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { 
  Plus, 
  CheckCircle2, 
  GitBranch, 
  MessageSquare, 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  Link2, 
  PaintBucket, 
  Baseline, 
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MindMapNodeData = {
  label: string;
  onAddChild?: () => void;
  onSave?: () => void;
  isNew?: boolean;
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
      {selected && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-gray-100 px-2 py-1.5 rounded-xl shadow-2xl z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
          <div className="flex items-center gap-2 pr-2 border-r border-gray-100">
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><CheckCircle2 size={16} /></button>
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><GitBranch size={16} /></button>
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><MessageSquare size={16} /></button>
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><FileText size={16} /></button>
          </div>
          <div className="flex items-center gap-2 pl-2">
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><PaintBucket size={16} /></button>
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={16} /></button>
          </div>
        </div>
      )}

      <div 
        className={cn(
          "relative transition-all duration-200 min-w-[160px] max-w-[320px]",
          "rounded-[20px] border-[2.5px] bg-white p-4 text-center shadow-sm",
          selected ? "border-blue-500 ring-4 ring-blue-50" : "border-blue-300"
        )}
      >
        <Handle type="target" position={Position.Left} className="opacity-0" />
        
        <div className="flex flex-col items-center justify-center min-h-[32px]">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent outline-none resize-none overflow-hidden font-bold text-base text-gray-800 text-center leading-tight"
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
              className="whitespace-pre-wrap break-words font-bold text-base text-gray-800 cursor-text leading-tight"
            >
              {label || "Novo Tópico"}
            </div>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChild?.();
          }}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-10",
            !selected && "opacity-0 group-hover:opacity-100"
          )}
        >
          <Plus size={16} strokeWidth={3} />
        </button>

        <Handle type="source" position={Position.Right} className="opacity-0" />
      </div>
    </div>
  );
};

export default memo(MindMapNode);