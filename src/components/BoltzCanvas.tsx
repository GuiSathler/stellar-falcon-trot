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
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  useStore,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindMapNode from './MindMapNode';
import { v4 as uuidv4 } from 'uuid';
import { showSuccess, showError } from '@/utils/toast';
import { 
  Layout, 
  PlusCircle, 
  Settings2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Download,
  Map as MapIcon,
  Undo2,
  Redo2,
  Plus,
  Minus,
  Target,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTypes = {
  mindmap: MindMapNode,
};

const BoltzCanvasInner = () => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(true);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [newRootName, setNewRootName] = useState('');
  
  const [past, setPast] = useState<{ nodes: Node[], edges: any[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[], edges: any[] }[]>([]);
  
  const { fitView, zoomIn, zoomOut, getEdges, getNodes, setViewport, getViewport, setNodes: setNodesFlow } = useReactFlow();
  const zoom = useStore((s) => s.transform[2]);

  const takeSnapshot = useCallback(() => {
    setPast((prev) => [...prev, { nodes: getNodes(), edges: getEdges() }].slice(-50));
    setFuture([]);
  }, [getNodes, getEdges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture((prev) => [{ nodes: getNodes(), edges: getEdges() }, ...prev]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setPast(newPast);
  }, [past, getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast((prev) => [...prev, { nodes: getNodes(), edges: getEdges() }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setFuture(newFuture);
  }, [future, getNodes, getEdges, setNodes, setEdges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onStartConnection = useCallback((id: string) => {
    setConnectingSourceId(id);
    showSuccess("Selecione o nó de destino");
  }, []);

  const onNodeClick = useCallback((targetId: string) => {
    if (connectingSourceId) {
      if (connectingSourceId === targetId) {
        setConnectingSourceId(null);
        return;
      }
      takeSnapshot();
      const newEdge = {
        id: `e-${connectingSourceId}-${targetId}`,
        source: connectingSourceId,
        target: targetId,
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setConnectingSourceId(null);
      showSuccess("Conectado!");
    }
  }, [connectingSourceId, setEdges, takeSnapshot]);

  const addChildNode = useCallback((parentId: string) => {
    takeSnapshot();
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      const currentEdges = getEdges();
      const childrenIds = currentEdges
        .filter(e => e.source === parentId)
        .map(e => e.target);
      
      const childrenCount = childrenIds.length;
      const verticalGap = 120;
      const xOffset = 300;
      
      const multiplier = Math.ceil(childrenCount / 2);
      const direction = childrenCount % 2 === 0 ? 1 : -1;
      const yOffset = childrenCount === 0 ? 0 : direction * (multiplier * verticalGap);
      
      const newNode: Node = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Tópico', 
          nodeType: 'idea',
          onAddChild: () => addChildNode(newNodeId),
          onStartConnection,
          onNodeClick,
          connectingSourceId: null
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
  }, [getEdges, setNodes, setEdges, onStartConnection, onNodeClick, takeSnapshot]);

  const handleOrganize = useCallback(() => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    const selectedNodes = currentNodes.filter(n => n.selected);
    
    const nodesToOrganize = selectedNodes.length > 0 ? selectedNodes : currentNodes;
    
    if (nodesToOrganize.length === 0) return;

    takeSnapshot();

    // Algoritmo de organização em árvore com proteção contra referências circulares
    const visited = new Set<string>();
    
    const organizeLevel = (parentId: string | null, startX: number, startY: number) => {
      // Proteção contra ciclos: se já visitamos este nó nesta ramificação, paramos
      if (parentId && visited.has(parentId)) return;
      if (parentId) visited.add(parentId);

      const children = currentEdges
        .filter(e => e.source === parentId)
        .map(e => nodesToOrganize.find(n => n.id === e.target))
        .filter(Boolean) as Node[];

      if (children.length === 0) return;

      const totalHeight = (children.length - 1) * 120;
      let currentY = startY - totalHeight / 2;

      children.forEach((child) => {
        setNodesFlow((nds) => nds.map(n => n.id === child.id ? {
          ...n,
          position: { x: startX + 300, y: currentY }
        } : n));
        
        organizeLevel(child.id, startX + 300, currentY);
        currentY += 120;
      });
      
      // Removemos do set após processar os filhos para permitir que o nó seja 
      // alcançado por outros caminhos se necessário, mas não em ciclos infinitos
      if (parentId) visited.delete(parentId);
    };

    // Encontra as raízes (nós sem pais dentro do conjunto a organizar)
    const roots = nodesToOrganize.filter(node => 
      !currentEdges.some(e => e.target === node.id && nodesToOrganize.some(n => n.id === e.source))
    );

    roots.forEach((root) => {
      const rootX = root.position.x;
      const rootY = root.position.y;
      organizeLevel(root.id, rootX, rootY);
    });

    showSuccess("Mapa organizado!");
    setTimeout(() => fitView({ duration: 800 }), 100);
  }, [getNodes, getEdges, setNodesFlow, takeSnapshot, fitView]);

  const confirmAddRootNode = () => {
    if (!newRootName.trim()) {
      showError("O nome do nó é obrigatório.");
      return;
    }

    takeSnapshot();
    const id = uuidv4();
    const newNode: Node = {
      id,
      type: 'mindmap',
      data: { 
        label: newRootName, 
        nodeType: 'idea',
        onAddChild: () => addChildNode(id),
        onStartConnection,
        onNodeClick,
        connectingSourceId: null
      },
      position: { x: 100, y: nodes.length * 150 + 100 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNewRootName('');
    setIsCreatingRoot(false);
    showSuccess("Nó pai criado!");
  };

  useEffect(() => {
    if (nodes.length === 0) {
      const id = uuidv4();
      const initialNode: Node = {
        id,
        type: 'mindmap',
        data: { 
          label: 'Meu novo mapa mental', 
          nodeType: 'idea',
          onAddChild: () => addChildNode(id),
          onStartConnection,
          onNodeClick,
          connectingSourceId: null
        },
        position: { x: 100, y: 100 },
      };
      setNodes([initialNode]);
    }
  }, []);

  useEffect(() => {
    setNodes((nds) => nds.map(n => ({
      ...n,
      data: { ...n.data, connectingSourceId }
    })));
  }, [connectingSourceId, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'smoothstep',
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' }
      }, eds));
    },
    [setEdges, takeSnapshot],
  );

  const handleManualZoom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = parseInt(e.currentTarget.value);
      if (!isNaN(value)) {
        const newZoom = Math.min(Math.max(value / 100, 0.1), 4);
        const { x, y } = getViewport();
        setViewport({ x, y, zoom: newZoom }, { duration: 300 });
      }
    }
  };

  return (
    <div className={cn("w-full h-full bg-[#fcfcfc] relative overflow-hidden", connectingSourceId && "cursor-crosshair")}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={takeSnapshot}
        nodeTypes={nodeTypes}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        panOnDrag={[1, 2]} // Permite pan com botão do meio ou dois dedos
        fitView
        className="bg-transparent"
      >
        <Background color="#f1f1f1" gap={40} size={1} />
        
        {/* Sidebar Direita */}
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
              {isCreatingRoot && isMenuOpen ? (
                <div className="flex flex-col gap-2 p-2 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <input 
                    autoFocus
                    placeholder="Nome do nó..."
                    className="text-xs p-2 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-200"
                    value={newRootName}
                    onChange={(e) => setNewRootName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmAddRootNode()}
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={confirmAddRootNode}
                      className="flex-1 bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => { setIsCreatingRoot(false); setNewRootName(''); }}
                      className="flex-1 bg-white text-gray-400 p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsCreatingRoot(true)}
                  className="flex items-center gap-2.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md mb-2"
                >
                  <PlusCircle size={18} />
                  {isMenuOpen && <span className="text-xs font-bold">Novo Pai</span>}
                </button>
              )}

              <div className="h-px bg-gray-100 my-1" />

              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all group">
                <Sparkles size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                {isMenuOpen && <span className="text-xs font-medium">Sugerir IA</span>}
              </button>

              <button 
                onClick={handleOrganize}
                className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all group"
              >
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

        {/* Barra de Ferramentas Unificada (Canto Inferior Esquerdo) */}
        <Panel position="bottom-left" className="m-6">
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-2xl">
            <div className="flex items-center border-r border-gray-100 pr-1.5">
              <button 
                onClick={undo} 
                disabled={past.length === 0}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  past.length === 0 ? "text-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                )}
                title="Desfazer"
              >
                <Undo2 size={18} />
              </button>
              <button 
                onClick={redo} 
                disabled={future.length === 0}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  future.length === 0 ? "text-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                )}
                title="Refazer"
              >
                <Redo2 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => zoomOut()} 
                className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all"
                title="Diminuir Zoom"
              >
                <Minus size={18} />
              </button>
              
              <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                <input 
                  type="text"
                  defaultValue={Math.round(zoom * 100)}
                  key={Math.round(zoom * 100)}
                  onKeyDown={handleManualZoom}
                  className="w-8 bg-transparent text-[11px] font-bold text-gray-700 text-center outline-none"
                />
                <span className="text-[10px] font-bold text-gray-400">%</span>
              </div>

              <button 
                onClick={() => zoomIn()} 
                className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all"
                title="Aumentar Zoom"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="pl-1.5 border-l border-gray-100">
              <button 
                onClick={() => fitView({ duration: 800 })} 
                className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all"
                title="Centralizar Mapa"
              >
                <Target size={18} />
              </button>
            </div>
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