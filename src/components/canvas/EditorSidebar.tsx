"use client";

import React from 'react';
import { Panel, useReactFlow, Node } from '@xyflow/react';
import { ListTree, Search, ChevronRight, Target, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const EditorSidebar = ({ isOpen, setIsOpen }: EditorSidebarProps) => {
  const { getNodes, getEdges, setCenter, setNodes } = useReactFlow();
  const nodes = getNodes();
  const edges = getEdges();

  const focusNode = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 800 });
      setNodes(nds => nds.map(n => ({ ...n, selected: n.id === id })));
    }
  };

  // Encontrar o nó raiz (aquele que não é alvo de nenhuma aresta)
  const rootNode = nodes.find(n => !edges.some(e => e.target === n.id));

  const renderOutline = (parentId: string, level: number = 0) => {
    const node = nodes.find(n => n.id === parentId);
    if (!node) return null;

    const children = edges.filter(e => e.source === parentId).map(e => e.target);

    return (
      <div key={node.id} className="space-y-1">
        <button 
          onClick={() => focusNode(node.id)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all hover:bg-blue-50 group",
            node.selected ? "bg-blue-50 text-blue-600" : "text-gray-600"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <ChevronRight size={14} className={cn("text-gray-300 transition-transform", children.length > 0 && "text-blue-400", node.selected && "rotate-90")} />
          <span className="text-xs font-bold truncate flex-1">{node.data.label || "Sem título"}</span>
          <Target size={12} className="opacity-0 group-hover:opacity-100 text-blue-400" />
        </button>
        {children.map(childId => renderOutline(childId, level + 1))}
      </div>
    );
  };

  return (
    <Panel position="top-left" className="h-[calc(100%-8rem)] mt-24 ml-4 pointer-events-none">
      <div className={cn(
        "bg-white border border-gray-100 shadow-2xl rounded-[24px] transition-all duration-300 pointer-events-auto flex flex-col overflow-hidden",
        isOpen ? "w-64 h-full" : "w-12 h-12"
      )}>
        <div className="p-3 flex items-center justify-between border-b border-gray-50">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ListTree size={20} />
          </button>
          {isOpen && <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Estrutura</span>}
          {isOpen && <div className="w-5" />}
        </div>

        {isOpen && (
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
              <input 
                type="text" 
                placeholder="Buscar tópico..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent rounded-xl text-[11px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              {rootNode ? renderOutline(rootNode.id) : (
                <p className="text-[10px] text-center text-gray-400 font-bold py-10">Nenhum tópico criado</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};