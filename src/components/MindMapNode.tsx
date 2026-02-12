"use client";

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { Plus, Trash2, Lightbulb, CheckCircle2, HelpCircle, AlertCircle, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Definindo a interface para os dados do nó para resolver erros de TS
export type MindMapNodeData = {
  label: string;
  nodeType?: string;
  onAddChild?: () => void;
  onStartConnection?: (id: string) => void;
  onNodeClick?: (id: string) => void;
  connectingSourceId?: string | null;
};

const NODE_TYPES = [
  { id: 'idea', icon: Lightbulb, color: 'text-amber-500', label: 'Ideia' },
  { id: 'task', icon: CheckCircle2, color: 'text-emerald-500', label: 'Tarefa' },
  { id: 'question', icon: HelpCircle, color: 'text-blue-500', label: 'Dúvida' },
  { id: 'alert', icon: AlertCircle, color: 'text-rose-500', label: 'Alerta' },
];

const MindMapNode = ({ id, data, selected }: NodeProps<Node<MindMapNodeData>>) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [label, setLabel] = useState(data.label);

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

  const isConnectingSource = data.connectingSourceId === id;

  return (
    <div 
      onClick={() => {
        if (typeof data.onNodeClick === 'function') data.onNodeClick(id);
      }}
      className={cn(
        "group relative bg-white border transition-all duration-300 ease-out",
        "rounded-xl px-3 py-2.5 min-w-[180px]",
        selected 
          ? "border-blue-500 shadow-xl ring-4 ring-blue-50" 
          : "border-gray-200 shadow-sm hover:border-gray-300",
        isConnectingSource && "ring-4 ring-blue-400 border-blue-500 animate-pulse"
      )}
    >
      {/* Handles invisíveis para manter a lógica de conexão do React Flow */}
      <Handle type="target" position={Position.Left} className="opacity-0 !pointer-events-none" />
      
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowTypePicker(!showTypePicker);
          }}
          className={cn("p-1 rounded-md hover:bg-gray-50 transition-colors", currentType.color)}
        >
          <Icon size={14} />
        </button>
        
        {isEditing ? (
          <input
            autoFocus
            className="text-xs font-bold text-gray-800 outline-none w-full bg-transparent"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          />
        ) : (
          <span 
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-xs font-bold text-gray-700 cursor-text truncate select-none flex-1"
          >
            {label}
          </span>
        )}
      </div>

      {showTypePicker && (
        <div className="absolute -bottom-12 left-0 flex gap-1 bg-white p-1 rounded-lg shadow-xl border border-gray-100 z-[100] animate-in fade-in slide-in-from-top-1">
          {NODE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={(e) => {
                e.stopPropagation();
                setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, nodeType: type.id } } : n));
                setShowTypePicker(false);
              }}
              className={cn("p-1.5 rounded hover:bg-gray-50 transition-colors", type.color)}
            >
              <type.icon size={14} />
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
          onClick={(e) => {
            e.stopPropagation();
            setNodes((nds) => nds.filter((n) => n.id !== id));
          }}
          className="p-1 bg-white border border-gray-100 rounded-md shadow-sm text-gray-400 hover:text-red-500"
          title="Excluir"
        >
          <Trash2 size={10} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (typeof data.onStartConnection === 'function') data.onStartConnection(id);
          }}
          className={cn(
            "p-1 border rounded-md shadow-sm transition-colors",
            isConnectingSource ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-400 hover:text-blue-600 border-gray-100"
          )}
          title="Conectar a outro nó"
        >
          <Link2 size={10} />
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (typeof data.onAddChild === 'function') data.onAddChild();
          }}
          className="p-1 bg-blue-600 rounded-md shadow-md text-white hover:bg-blue-700"
          title="Adicionar Filho"
        >
          <Plus size={10} strokeWidth={3} />
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0 !pointer-events-none" />
    </div>
  );
};

export default memo(MindMapNode);