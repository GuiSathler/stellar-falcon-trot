"use client";

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
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
import { Maximize, Minimize2, Trash, Download, Layout } from 'lucide-react';

const nodeTypes = {
  mindmap: MindMapNode,
};

const BoltzCanvasInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      // Metodologia Boltz Dynamic Spacing:
      // Calcula o offset baseado no número de filhos e na profundidade
      const children = nds.filter(n => edges.some(e => e.source === parentId && e.target === n.id));
      const index = children.length;
      
      // Espaçamento dinâmico: quanto mais filhos, maior a dispersão vertical
      const verticalGap = 100;
      const yOffset = (index - (children.length / 2)) * verticalGap;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Insight', 
          color: parentNode.data.color || 'Blue',
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
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      }
    ]);
  }, [edges, setNodes, setEdges]);

  useEffect(() => {
    if (nodes.length === 0) {
      const rootId = 'root';
      setNodes([
        {
          id: rootId,
          type: 'mindmap',
          data: { 
            label: 'Objetivo Central', 
            color: 'Blue',
            onAddChild: () => addChildNode(rootId) 
          },
          position: { x: 100, y: 300 },
        },
      ]);
    }
  }, [addChildNode, nodes.length, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const clearCanvas = () => {
    if (confirm("Deseja limpar todo o mapa?")) {
      setNodes([]);
      showSuccess("Canvas limpo.");
    }
  };

  return (
    <div className="w-full h-full bg-white relative group/canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50/50"
      >
        <Background color="#e2e8f0" gap={30} size={1} />
        
        {/* Toolbar Customizada */}
        <Panel position="bottom-center" className="mb-6">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl border shadow-2xl">
            <button onClick={() => zoomIn()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"><Maximize size={18} /></button>
            <button onClick={() => zoomOut()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"><Minimize2 size={18} /></button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button onClick={() => fitView()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"><Layout size={18} /></button>
            <button onClick={clearCanvas} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500"><Trash size={18} /></button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              <Download size={14} />
              Exportar
            </button>
          </div>
        </Panel>

        <MiniMap 
          className="!bg-white/80 !backdrop-blur-md !border-gray-100 !rounded-2xl !shadow-2xl !m-6"
          nodeColor={(n) => {
            if (n.data.color === 'Emerald') return '#10b981';
            if (n.data.color === 'Amber') return '#f59e0b';
            if (n.data.color === 'Rose') return '#f43f5e';
            return '#3b82f6';
          }}
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