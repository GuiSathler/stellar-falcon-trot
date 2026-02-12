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
  const { fitView, zoomIn, zoomOut, getEdges } = useReactFlow();

  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      // Obtém as conexões atuais para contar os filhos reais deste pai
      const currentEdges = getEdges();
      const childrenIds = currentEdges
        .filter(e => e.source === parentId)
        .map(e => e.target);
      
      const childrenCount = childrenIds.length;
      const verticalGap = 120;
      const xOffset = 300;
      
      // Algoritmo de Distribuição em Leque:
      // Distribui os nós verticalmente: 0, +120, -120, +240, -240...
      const multiplier = Math.ceil(childrenCount / 2);
      const direction = childrenCount % 2 === 0 ? 1 : -1;
      const yOffset = childrenCount === 0 ? 0 : direction * (multiplier * verticalGap);
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Tópico', 
          nodeType: 'idea',
          onAddChild: () => addChildNode(newNodeId) 
        },
        position: { 
          x: parentNode.position.x + xOffset, 
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
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
      }
    ]);
  }, [getEdges, setNodes, setEdges]);

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
        
        {/* Sidebar Direita Compacta e Organizada */}
        <Panel position="top-right" className="h-[calc(100%-2rem)] flex items-center pointer-events-none">
          <div className={cn(
            "bg-white border border-gray-100 shadow-2xl rounded-2xl transition-all duration-300 pointer-events-auto flex flex-col overflow-hidden",
            isMenuOpen ? "w-52 p-3" : "w-12 p-2"
          )}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mb-4 p-1.5 hover:bg-gray-50 rounded-lg transition-colors self-end"
            >
              {isMenuOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={cn("flex flex-col gap-1.5", !isMenuOpen && "items-center")}>
              <button 
                onClick={addRootNode}
                className="flex items-center gap-2.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md mb-2"
              >
                <PlusCircle size={18} />
                {isMenuOpen && <span className="text-xs font-bold">Novo Pai</span>}
              </button>

              <div className="h-px bg-gray-100 my-1" />

              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all group">
                <Link2 size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                {isMenuOpen && <span className="text-xs font-medium">Conectar Nós</span>}
              </button>

              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all group">
                <Sparkles size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                {isMenuOpen && <span className="text-xs font-medium">Sugerir IA</span>}
              </button>

              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all group">
                <Layout size={18} className="text-indigo-400" />
                {isMenuOpen && <span className="text-xs font-medium">Organizar</span>}
              </button>

              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all group">
                <Settings2 size={18} className="text-gray-400" />
                {isMenuOpen && <span className="text-xs font-medium">Ajustes</span>}
              </button>

              <div className="mt-auto pt-4">
                <button className="w-full flex items-center gap-2.5 p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
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
            className={cn(
              "p-2 bg-white border border-gray-100 rounded-xl shadow-lg transition-all",
              isMiniMapOpen ? "text-blue-600" : "text-gray-400 hover:text-blue-600"
            )}
            title={isMiniMapOpen ? "Recolher Mapa" : "Expandir Mapa"}
          >
            <MapIcon size={18} />
          </button>
          
          {isMiniMapOpen && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <MiniMap 
                style={{ width: 140, height: 90, margin: 0 }}
                nodeStrokeColor="#e2e8f0"
                nodeColor="#ffffff"
                maskColor="rgba(255, 255, 255, 0.3)"
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