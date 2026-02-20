"use client";

import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { 
  Plus, 
  Trash2, 
  Type, 
  Palette, 
  Type as FontIcon, 
  ChevronDown,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type MindMapNodeData = {
  label: string;
  nodeType?: string;
  onAddChild?: () => void;
  onStartConnection?: (id: string) => void;
  onNodeClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  isNew?: boolean;
  style?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    borderRadius?: number;
  };
};

const COLORS = [
  { name: 'Branco', bg: 'bg-white', text: 'text-gray-800', hex: '#ffffff' },
  { name: 'Azul', bg: 'bg-blue-500', text: 'text-white', hex: '#3b82f6' },
  { name: 'Verde', bg: 'bg-emerald-500', text: 'text-white', hex: '#10b981' },
  { name: 'Amarelo', bg: 'bg-amber-400', text: 'text-gray-900', hex: '#fbbf24' },
  { name: 'Rosa', bg: 'bg-rose-500', text: 'text-white', hex: '#f43f5e' },
  { name: 'Roxo', bg: 'bg-violet-500', text: 'text-white', hex: '#8b5cf6' },
];

const FONTS = [
  { name: 'Inter', value: 'font-sans' },
  { name: 'Serif', value: 'font-serif' },
  { name: 'Mono', value: 'font-mono' },
];

const MindMapNode = ({ id, data, selected }: NodeProps<Node<MindMapNodeData>>) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [label, setLabel] = useState(data.label);
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

  const updateStyle = (newStyle: Partial<MindMapNodeData['style']>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              style: { ...(node.data.style || {}), ...newStyle }
            }
          };
        }
        return node;
      })
    );
  };

  const nodeStyle = data.style || {};

  return (
    <div 
      className={cn(
        "group relative transition-all duration-200 ease-out min-w-[180px] max-w-[350px]",
        "rounded-xl border-2 shadow-sm",
        selected ? "ring-4 ring-blue-100 border-blue-500" : "border-transparent",
        nodeStyle.backgroundColor ? "" : "bg-white border-gray-200"
      )}
      style={{ 
        backgroundColor: nodeStyle.backgroundColor,
        color: nodeStyle.color,
        borderRadius: nodeStyle.borderRadius ? `${nodeStyle.borderRadius}px` : '12px'
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-3 !h-3 !-left-1.5 border-2 border-white" />
      
      <div className="p-3">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className={cn(
              "w-full bg-transparent outline-none resize-none overflow-hidden font-bold leading-tight",
              nodeStyle.fontFamily || "font-sans"
            )}
            style={{ fontSize: nodeStyle.fontSize ? `${nodeStyle.fontSize}px` : '14px' }}
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
              "whitespace-pre-wrap break-words font-bold cursor-text min-h-[1.5em] leading-tight",
              nodeStyle.fontFamily || "font-sans"
            )}
            style={{ fontSize: nodeStyle.fontSize ? `${nodeStyle.fontSize}px` : '14px' }}
          >
            {label || "Clique duplo para editar"}
          </div>
        )}
      </div>

      {/* Toolbar de Personalização */}
      <div className={cn(
        "absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-gray-100 p-1 rounded-xl shadow-xl z-50 transition-all",
        selected ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500"><Palette size={14} /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="grid grid-cols-3 gap-1 p-2">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => updateStyle({ backgroundColor: c.hex, color: c.hex === '#ffffff' ? '#1f2937' : '#ffffff' })}
                className={cn("w-6 h-6 rounded-full border border-gray-100", c.bg)}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500"><FontIcon size={14} /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {FONTS.map((f) => (
              <DropdownMenuItem key={f.value} onClick={() => updateStyle({ fontFamily: f.value })}>
                <span className={f.value}>{f.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="p-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400">TAM</span>
              <input 
                type="range" min="10" max="32" 
                value={nodeStyle.fontSize || 14}
                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                className="w-20"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-4 bg-gray-100 mx-1" />

        <button 
          onClick={() => data.onAddChild?.()}
          className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={14} />
        </button>
        
        <button 
          onClick={() => setNodes((nds) => nds.filter(n => n.id !== id))}
          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-3 !h-3 !-right-1.5 border-2 border-white" />
    </div>
  );
};

export default memo(MindMapNode);