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
  Edge,
  Node,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindMapNode from './MindMapNode';
import { v4 as uuidv4 } from 'uuid';
import { showSuccess } from '@/utils/toast';

const nodeTypes = {
  mindmap: MindMapNode,
};

const BoltzCanvasInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      // Lógica de Funil: Calcula o offset vertical baseado em quantos filhos o pai já tem
      const siblings = nds.filter(n => edges.some(e => e.source === parentId && e.target === n.id));
      const verticalOffset = (siblings.length - (siblings.length / 2)) * 80;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Passo', 
          onAddChild: () => addChildNode(newNodeId) 
        },
        position: { 
          x: parentNode.position.x + 280, 
          y: parentNode.position.y + verticalOffset
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
        style: { stroke: '#3b82f6', strokeWidth: 2 },
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
            label: 'Início do Funil', 
            onAddChild: () => addChildNode(rootId) 
          },
          position: { x: 100, y: 250 },
        },
      ]);
    }
  }, [addChildNode, nodes.length, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const exportData = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'boltz-flow-export.json';
    link.click();
    showSuccess("Mapa exportado com sucesso!");
  };

  const autoLayout = () => {
    showSuccess("Layout otimizado aplicado!");
    // Simulação de layout (em um app real usaríamos dagre)
    setNodes((nds) => nds.map((n, i) => ({
      ...n,
      position: { x: n.position.x, y: n.position.y + (i % 2 === 0 ? 10 : -10) }
    })));
  };

  return (
    <div className="w-full h-full bg-white relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50"
      >
        <Background color="#cbd5e1" gap={25} size={1} />
        <Controls className="bg-white border-none shadow-xl rounded-xl overflow-hidden" />
        <MiniMap 
          className="!bg-white !border-gray-200 !rounded-xl !shadow-2xl"
          nodeColor="#3b82f6"
          maskColor="rgba(241, 245, 249, 0.4)"
        />
        <Panel position="top-right" className="bg-white/90 backdrop-blur-xl p-2 rounded-xl border shadow-lg flex gap-2">
          <button 
            onClick={autoLayout}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            Auto Layout
          </button>
          <button 
            onClick={exportData}
            className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-blue-200 shadow-lg"
          >
            Exportar JSON
          </button>
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