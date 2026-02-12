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
  MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTypes = {
  mindmap: MindMapNode,
};

const BoltzCanvasInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      // Boltz Anti-Collision v2
      const children = nds.filter(n => edges.some(e => e.source === parentId && e.target === n.id));
      const verticalGap = 120;
      const yOffset = (children.length - (children.length / 2)) * verticalGap;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Tópico', 
          onAddChild: () => addChildNode(newNodeId) 
        },
        position: { 
          x: parentNode.position.x + 300, 
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
        animated: false,
        style: { stroke: '#e2e8f0', strokeWidth: 1.5 },
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
        onAddChild: () => addChildNode(id) 
      },
      position: { x: 100, y: nodes.length * 150 + 100 },
    };
    setNodes((nds) => [...nds, newNode]);
    showSuccess("Novo tópico central adicionado");
  }, [nodes.length, setNodes, addChildNode]);

  useEffect(() => {
    if (nodes.length === 0) {
      addRootNode();
    }
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#e2e8f0', strokeWidth: 1.5 } }, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full bg-[#fafafa] relative overflow-hidden">
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
        <Background color="#f1f1f1" gap={40} size={1} />
        
        {/* Menu Flutuante Lateral (Direita) */}
        <Panel position="top-right" className="h-[calc(100%-2rem)] flex items-center pointer-events-none">
          <div className={cn(
            "bg-white border border-gray-100 shadow-2xl rounded-3xl transition-all duration-500 pointer-events-auto flex flex-col overflow-hidden",
            isMenuOpen ? "w-64 p-4" : "w-12 p-2"
          )}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mb-6 p-2 hover:bg-gray-50 rounded-xl transition-colors self-end"
            >
              {isMenuOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className={cn("flex flex-col gap-4", !isMenuOpen && "items-center")}>
              <button 
                onClick={addRootNode}
                className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all group"
              >
                <PlusCircle size={20} />
                {isMenuOpen && <span className="text-sm font-bold">Novo Tópico</span>}
              </button>

              <div className="h-px bg-gray-100 my-2" />

              <button className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">
                <Sparkles size={20} className="text-amber-400" />
                {isMenuOpen && <span className="text-sm font-medium">Sugerir com IA</span>}
              </button>

              <button className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">
                <Layout size={20} />
                {isMenuOpen && <span className="text-sm font-medium">Auto-organizar</span>}
              </button>

              <button className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">
                <Settings2 size={20} />
                {isMenuOpen && <span className="text-sm font-medium">Temas</span>}
              </button>

              <div className="mt-auto flex flex-col gap-2">
                <button className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">
                  <Download size={20} />
                  {isMenuOpen && <span className="text-sm font-medium">Exportar</span>}
                </button>
              </div>
            </div>
          </div>
        </Panel>

        {/* Controles de Navegação Minimalistas */}
        <Panel position="bottom-left" className="m-6 flex gap-2">
          <div className="flex bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-1 shadow-lg">
            <button onClick={() => zoomIn()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><Maximize size={16} /></button>
            <button onClick={() => zoomOut()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><Minimize2 size={16} /></button>
            <button onClick={() => fitView()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><MousePointer2 size={16} /></button>
          </div>
        </Panel>

        <MiniMap 
          className="!bg-white/50 !backdrop-blur-sm !border-gray-100 !rounded-3xl !shadow-xl !m-6"
          nodeStrokeColor="#e2e8f0"
          nodeColor="#ffffff"
          maskColor="rgba(255, 255, 255, 0.2)"
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