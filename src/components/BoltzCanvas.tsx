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
  Link2,
  Map as MapIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTypes = {
  mindmap: MindMapNode,
};

const BoltzCanvasInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(true);
  const { fitView, zoomIn, zoomOut, getNodes } = useReactFlow();

  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      // Lógica Anti-Sobreposição: Calcula posição baseada nos filhos existentes
      const children = nds.filter(n => edges.some(e => e.source === parentId && e.target === n.id));
      const verticalGap = 100;
      const xOffset = 280;
      
      // Encontra a maior e menor posição Y dos filhos para evitar overlap
      let nextY = parentNode.position.y;
      if (children.length > 0) {
        const maxY = Math.max(...children.map(c => c.position.y));
        nextY = maxY + verticalGap;
      } else {
        nextY = parentNode.position.y;
      }
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Tópico', 
          nodeType: 'idea',
          onAddChild: () => addChildNode(newNodeId) 
        },
        position: { x: parentNode.position.x + xOffset, y: nextY },
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
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
      }
    ]);
  }, [edges, setNodes, setEdges]);

  const addRootNode = useCallback(() => {
    const id = uuidv4();
    const newNode: Node = {
      id,
      type: 'mindmap',
      data: { 
        label: 'Tópico Central', 
        nodeType: 'idea',
        onAddChild: () => addChildNode(id) 
      },
      position: { x: 100, y: nodes.length * 150 + 100 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes, addChildNode]);

  useEffect(() => {
    if (nodes.length === 0) addRootNode();
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'smoothstep',
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' }
      }, eds));
      showSuccess("Conexão criada!");
    },
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
        <Background color="#f1f1f1" gap={40} size={1} />
        
        {/* Sidebar Direita Compacta */}
        <Panel position="top-right" className="h-[calc(100%-2rem)] flex items-center pointer-events-none">
          <div className={cn(
            "bg-white border border-gray-100 shadow-2xl rounded-2xl transition-all duration-300 pointer-events-auto flex flex-col overflow-hidden",
            isMenuOpen ? "w-56 p-3" : "w-12 p-2"
          )}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mb-4 p-1.5 hover:bg-gray-50 rounded-lg transition-colors self-end"
            >
              {isMenuOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={cn("flex flex-col gap-2", !isMenuOpen && "items-center")}>
              <button 
                onClick={addRootNode}
                className="flex items-center gap-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
              >
                <PlusCircle size={18} />
                {isMenuOpen && <span className="text-xs font-bold">Novo Pai</span>}
              </button>

              <div className="h-px bg-gray-100 my-1" />

              <button className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                <Link2 size={18} className="text-blue-500" />
                {isMenuOpen && <span className="text-xs font-medium">Conexão Manual</span>}
              </button>

              <button className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                <Sparkles size={18} className="text-amber-400" />
                {isMenuOpen && <span className="text-xs font-medium">Sugerir com IA</span>}
              </button>

              <button className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                <Layout size={18} />
                {isMenuOpen && <span className="text-xs font-medium">Auto-organizar</span>}
              </button>

              <button className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                <Settings2 size={18} />
                {isMenuOpen && <span className="text-xs font-medium">Temas</span>}
              </button>

              <div className="mt-auto">
                <button className="w-full flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                  <Download size={18} />
                  {isMenuOpen && <span className="text-xs font-medium">Exportar</span>}
                </button>
              </div>
            </div>
          </div>
        </Panel>

        {/* Controles de Navegação */}
        <Panel position="bottom-left" className="m-6 flex gap-2">
          <div className="flex bg-white border border-gray-100 rounded-xl p-1 shadow-lg">
            <button onClick={() => zoomIn()} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Maximize size={16} /></button>
            <button onClick={() => zoomOut()} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Minimize2 size={16} /></button>
            <button onClick={() => fitView()} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><MousePointer2 size={16} /></button>
          </div>
        </Panel>

        {/* MiniMap Retrátil */}
        <Panel position="bottom-right" className="m-6 flex flex-col items-end gap-2">
          <button 
            onClick={() => setIsMiniMapOpen(!isMiniMapOpen)}
            className="p-2 bg-white border border-gray-100 rounded-xl shadow-lg text-gray-500 hover:text-blue-600 transition-colors"
            title="Alternar MiniMap"
          >
            <MapIcon size={18} />
          </button>
          
          {isMiniMapOpen && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <MiniMap 
                style={{ width: 150, height: 100, margin: 0 }}
                nodeStrokeColor="#e2e8f0"
                nodeColor="#ffffff"
                maskColor="rgba(255, 255, 255, 0.2)"
              />
            </div>
          )}
        </Panel>
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