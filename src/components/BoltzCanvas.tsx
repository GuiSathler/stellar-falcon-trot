"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindMapNode from './MindMapNode';
import { v4 as uuidv4 } from 'uuid';
import { showSuccess } from '@/utils/toast';
import { 
  Maximize, 
  Minimize2, 
  Layout, 
  PlusCircle, 
  Settings2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Download,
  MousePointer2,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTypes = {
  mindmap: MindMapNode,
};

const BoltzCanvasInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const { fitView, zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();

  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      const children = nds.filter(n => edges.some(e => e.source === parentId && e.target === n.id));
      const verticalGap = 140;
      const yOffset = (children.length - (children.length / 2)) * verticalGap;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Tópico', 
          nodeType: 'idea',
          onAddChild: () => addChildNode(newNodeId) 
        },
        position: { 
          x: parentNode.position.x + 320, 
          y: parentNode.position.y + yOffset
        },
      };

      return [...nds, newNode];
    });

    setEdges((eds) => [
      ...eds,
      {
        id: `e-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1', width: 10, height: 10 },
      }
    ]);
  }, [edges, setNodes, setEdges]);

  const addRootNode = useCallback(() => {
    const id = uuidv4();
    const newNode: Node = {
      id,
      type: 'mindmap',
      data: { 
        label: 'Novo Tópico Central', 
        nodeType: 'idea',
        onAddChild: () => addChildNode(id) 
      },
      position: { x: 100, y: nodes.length * 200 + 100 },
    };
    setNodes((nds) => [...nds, newNode]);
    showSuccess("Novo tópico central adicionado");
  }, [nodes.length, setNodes, addChildNode]);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedNode = getNodes().find(n => n.selected);
      
      if (selectedNode) {
        if (e.key === 'Tab') {
          e.preventDefault();
          addChildNode(selectedNode.id);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          // Encontrar o pai para criar um irmão
          const edge = getEdges().find(ed => ed.target === selectedNode.id);
          if (edge) {
            addChildNode(edge.source);
          } else {
            addRootNode();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getNodes, getEdges, addChildNode, addRootNode]);

  useEffect(() => {
    if (nodes.length === 0) addRootNode();
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      style: { stroke: '#cbd5e1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' }
    }, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full bg-[#fcfcfc] relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#e5e7eb" gap={40} size={1} />
        
        {/* Menu Flutuante Lateral */}
        <Panel position="top-right" className="h-[calc(100%-2rem)] flex items-center pointer-events-none">
          <div className={cn(
            "bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[2.5rem] transition-all duration-500 pointer-events-auto flex flex-col overflow-hidden",
            isMenuOpen ? "w-72 p-6" : "w-14 p-2"
          )}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mb-8 p-2 hover:bg-gray-100 rounded-2xl transition-colors self-end"
            >
              {isMenuOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div className={cn("flex flex-col gap-6", !isMenuOpen && "items-center")}>
              <button 
                onClick={addRootNode}
                className="flex items-center gap-4 p-4 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-100"
              >
                <PlusCircle size={24} />
                {isMenuOpen && <span className="text-sm font-black tracking-tight">Novo Tópico</span>}
              </button>

              <div className="h-px bg-gray-100 my-2" />

              <div className="space-y-2">
                <button className="w-full flex items-center gap-4 p-3 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">
                  <Sparkles size={20} className="text-amber-400" />
                  {isMenuOpen && <span className="text-sm font-bold">Sugerir com IA</span>}
                </button>

                <button className="w-full flex items-center gap-4 p-3 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">
                  <Layout size={20} className="text-blue-400" />
                  {isMenuOpen && <span className="text-sm font-bold">Auto-organizar</span>}
                </button>

                <button className="w-full flex items-center gap-4 p-3 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">
                  <Settings2 size={20} className="text-purple-400" />
                  {isMenuOpen && <span className="text-sm font-bold">Temas</span>}
                </button>
              </div>

              {isMenuOpen && (
                <div className="mt-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <Keyboard size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Atalhos</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Novo Filho</span>
                      <kbd className="bg-white px-1.5 py-0.5 rounded border shadow-sm">Tab</kbd>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Novo Irmão</span>
                      <kbd className="bg-white px-1.5 py-0.5 rounded border shadow-sm">Enter</kbd>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <button className="w-full flex items-center gap-4 p-3 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">
                  <Download size={20} />
                  {isMenuOpen && <span className="text-sm font-bold">Exportar JSON</span>}
                </button>
              </div>
            </div>
          </div>
        </Panel>

        {/* Controles de Navegação */}
        <Panel position="bottom-left" className="m-8 flex gap-3">
          <div className="flex bg-white/90 backdrop-blur-md border border-gray-100 rounded-[2rem] p-2 shadow-2xl">
            <button onClick={() => zoomIn()} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors"><Maximize size={18} /></button>
            <button onClick={() => zoomOut()} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors"><Minimize2 size={18} /></button>
            <button onClick={() => fitView()} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors"><MousePointer2 size={18} /></button>
          </div>
        </Panel>

        <MiniMap 
          className="!bg-white/80 !backdrop-blur-xl !border-gray-100 !rounded-[2.5rem] !shadow-2xl !m-8"
          nodeStrokeColor="#f3f4f6"
          nodeColor="#ffffff"
          maskColor="rgba(255, 255, 255, 0.4)"
        />
      </ReactFlow>
    </div>
  );
};

const BoltzCanvas = () => (
  <ReactFlowProvider>
    <BoltzCanvasInner />
  </ReactFlowProvider>
);

export default BoltzCanvas;