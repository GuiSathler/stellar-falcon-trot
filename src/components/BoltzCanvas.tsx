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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindMapNode from './MindMapNode';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  mindmap: MindMapNode,
};

const BoltzCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Função estável para adicionar nós filhos
  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      // Lógica simples de anti-sobreposição: deslocamento baseado no número de filhos existentes
      const existingChildrenCount = nds.filter(n => n.id.startsWith(`node-${parentId}`)).length;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Nó', 
          onAddChild: () => addChildNode(newNodeId) 
        },
        position: { 
          x: parentNode.position.x + 250, 
          y: parentNode.position.y + (existingChildrenCount * 60) - 30
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
  }, [setNodes, setEdges]);

  // Inicialização única dos nós
  useEffect(() => {
    const rootId = 'root';
    setNodes([
      {
        id: rootId,
        type: 'mindmap',
        data: { 
          label: 'Boltz Flow Root', 
          onAddChild: () => addChildNode(rootId) 
        },
        position: { x: 250, y: 250 },
      },
    ]);
  }, [addChildNode, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

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
        <Background color="#e2e8f0" gap={20} />
        <Controls className="bg-white border-none shadow-lg rounded-lg overflow-hidden" />
        <MiniMap 
          className="!bg-white !border-gray-200 !rounded-lg !shadow-lg"
          nodeColor="#3b82f6"
          maskColor="rgba(241, 245, 249, 0.7)"
        />
        <Panel position="top-right" className="bg-white/80 backdrop-blur-md p-2 rounded-lg border shadow-sm flex gap-2">
          <button className="px-3 py-1 text-xs font-medium hover:bg-gray-100 rounded transition-colors">Auto Layout</button>
          <button className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Exportar</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default BoltzCanvas;