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
import { Switch } from "@/components/ui/switch";

export type MindMapNodeData = {
  label: string;
  onAddChild?: () => void;
  isNew?: boolean;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    fontSize?: number;
  };
};

const MindMapNode = ({ id, data, selected }: NodeProps<Node<MindMapNodeData>>) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [label, setLabel] = useState(data.label);
  const [autoAlign, setAutoAlign] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(label.length, label.length);
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (!label.trim() && data.isNew) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { 
            ...node, 
            data: { ...node.data, label: label.trim(), isNew: false } 
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="relative group">
      {/* Floating Toolbar */}
      {selected && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-gray-100 px-3 py-2 rounded-xl shadow-2xl z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
          <div className="flex items-center gap-3 pr-3 border-r border-gray-100">
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><CheckCircle2 size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><GitBranch size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><MessageSquare size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><FileText size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><ImageIcon size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><Paperclip size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><Smile size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><Link2 size={18} /></button>
          </div>

          <div className="flex items-center gap-2 px-3 border-r border-gray-100">
            <Switch 
              checked={autoAlign} 
              onCheckedChange={setAutoAlign}
              className="data-[state=checked]:bg-blue-500 scale-75"
            />
            <span className="text-[11px] font-bold text-blue-300">Alinhamento automático</span>
          </div>

          <div className="flex items-center gap-3 pl-3">
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><PaintBucket size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><Baseline size={18} /></button>
            <button className="text-gray-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={18} /></button>
          </div>
        </div>
      )}

      {/* Node Body */}
      <div 
        className={cn(
          "relative transition-all duration-200 min-w-[220px] max-w-[400px]",
          "rounded-[28px] border-[3px] bg-white p-6 text-center shadow-sm",
          selected ? "border-blue-500 ring-8 ring-blue-50" : "border-blue-400"
        )}
      >
        <Handle type="target" position={Position.Left} className="opacity-0" />
        
        <div className="flex flex-col items-center justify-center min-h-[40px]">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent outline-none resize-none overflow-hidden font-black text-xl text-gray-700 text-center leading-tight"
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
              className="whitespace-pre-wrap break-words font-black text-xl text-gray-700 cursor-text leading-tight"
            >
              {label || "Novo Tópico"}
            </div>
          )}
        </div>

        {/* Add Button (Right Side) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChild?.();
          }}
          className={cn(
            "absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-10",
            !selected && "opacity-0 group-hover:opacity-100"
          )}
        >
          <Plus size={20} strokeWidth={3} />
        </button>

        <Handle type="source" position={Position.Right} className="opacity-0" />
      </div>
    </div>
  );
};

export default memo(MindMapNode);