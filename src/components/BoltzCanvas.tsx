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
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindMapNode from './MindMapNode';
import { v4 as uuidv4 } from 'uuid';
import { showSuccess } from '@/utils/toast';
import { 
  Layout, 
  PlusCircle, 
  Settings2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Download,
  Map as MapIcon,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMindMapHistory } from '@/hooks/useMindMapHistory';
import { useMindMapPersistence } from '@/hooks/useMindMapPersistence';
import { TopLeftPanel } from './canvas/TopLeftPanel';
import { BottomLeftPanel } from './canvas/BottomLeftPanel';

const nodeTypes = { mindmap: MindMapNode };

interface BoltzCanvasProps {
  mapId?: string;
  onBack?: () => void;
}

const BoltzCanvasInner = ({ mapId, onBack }: BoltzCanvasProps) => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(true);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [newRootName, setNewRootName] = useState('');
  
  const { fitView, getEdges, getNodes, setNodes: setNodesFlow } = useReactFlow();
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useMindMapHistory();
  const { loadMap, saveMap, isLoading, isSaving } = useMindMapPersistence(mapId);

  const onStartConnection = useCallback((id: string) => {
    setConnectingSourceId(id);
    showSuccess("Selecione o nó de destino");
  }, []);

  const handleNodeClick = useCallback((targetId: string) => {
    setConnectingSourceId((currentSourceId) => {
      if (currentSourceId && currentSourceId !== targetId) {
        takeSnapshot(getNodes(), getEdges());
        const newEdge = {
          id: `e-${currentSourceId}-${targetId}`,
          source: currentSourceId,
          target: targetId,
          type: 'smoothstep',
          style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        };
        setEdges((eds) => addEdge(newEdge, eds));
        showSuccess("Conectado!");
        return null;
      }
      return currentSourceId;
    });
  }, [setEdges, takeSnapshot, getNodes, getEdges]);

  const addChildNode = useCallback((parentId: string) => {
    takeSnapshot(getNodes(), getEdges());
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;
      const newNode = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: 'Novo Tópico', 
          onAddChild: () => addChildNode(newNodeId),
          onStartConnection,
          onNodeClick: (id: string) => handleNodeClick(id),
        },
        position: { x: parentNode.position.x + 300, y: parentNode.position.y },
      };
      return [...nds, newNode];
    });

    setEdges((eds) => [...eds, {
      id: `e-${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      type: 'smoothstep',
      style: { stroke: '#cbd5e1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
    }]);
  }, [getEdges, setNodes, setEdges, onStartConnection, takeSnapshot, getNodes, handleNodeClick]);

  const hydrateNodes = useCallback((nodesToHydrate: Node[]) => {
    return nodesToHydrate.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onAddChild: () => addChildNode(node.id),
        onStartConnection: () => onStartConnection(node.id),
        onNodeClick: (id: string) => handleNodeClick(id),
      }
    }));
  }, [addChildNode, onStartConnection, handleNodeClick]);

  useEffect(() => {
    loadMap().then((content) => {
      if (content) {
        setNodes(hydrateNodes(content.nodes));
        setEdges(content.edges);
        setTimeout(() => fitView({ duration: 800 }), 100);
      }
    });
  }, [loadMap, setNodes, setEdges, fitView, hydrateNodes]);

  const handleUndo = () => {
    const prev = undo(getNodes(), getEdges());
    if (prev) {
      setNodes(hydrateNodes(prev.nodes));
      setEdges(prev.edges);
    }
  };

  const handleRedo = () => {
    const next = redo(getNodes(), getEdges());
    if (next) {
      setNodes(hydrateNodes(next.nodes));
      setEdges(next.edges);
    }
  };

  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  if (isLoading) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-gray-500 font-bold">Carregando seu mapa...</p>
    </div>
  );

  return (
    <div className={cn("w-full h-full bg-[#fcfcfc] relative overflow-hidden", connectingSourceId && "cursor-crosshair")}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={() => takeSnapshot(getNodes(), getEdges())}
        nodeTypes={nodeTypes}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        panOnDrag={[1, 2]}
        fitView
      >
        <Background color="#f1f1f1" gap={40} size={1} />
        
        <TopLeftPanel onBack={onBack} onSave={() => saveMap(getNodes(), getEdges())} isSaving={isSaving} />

        <Panel position="top-right" className="h-[calc(100%-2rem)] flex items-center pointer-events-none">
          <div className={cn("bg-white border border-gray-100 shadow-2xl rounded-2xl transition-all pointer-events-auto flex flex-col overflow-hidden", isMenuOpen ? "w-52 p-3" : "w-12 p-2")}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mb-4 p-1.5 hover:bg-gray-50 rounded-lg self-end">
              {isMenuOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <div className={cn("flex flex-col gap-1.5", !isMenuOpen && "items-center")}>
              <button onClick={() => setIsCreatingRoot(true)} className="flex items-center gap-2.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md mb-2">
                <PlusCircle size={18} />
                {isMenuOpen && <span className="text-xs font-bold">Novo Pai</span>}
              </button>
              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl"><Sparkles size={18} className="text-amber-400" />{isMenuOpen && <span className="text-xs font-medium">Sugerir IA</span>}</button>
              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl"><Layout size={18} className="text-indigo-400" />{isMenuOpen && <span className="text-xs font-medium">Organizar</span>}</button>
              <button className="flex items-center gap-2.5 p-2 text-gray-500 hover:bg-gray-50 rounded-xl mt-auto"><Download size={18} />{isMenuOpen && <span className="text-xs font-medium">Exportar</span>}</button>
            </div>
          </div>
        </Panel>

        <BottomLeftPanel onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo} />

        <Panel position="bottom-right" className="m-6 flex flex-col items-end gap-2">
          <button onClick={() => setIsMiniMapOpen(!isMiniMapOpen)} className={cn("p-2 bg-white border border-gray-100 rounded-xl shadow-lg", isMiniMapOpen ? "text-blue-600" : "text-gray-400")}><MapIcon size={18} /></button>
          {isMiniMapOpen && <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"><MiniMap style={{ width: 140, height: 90 }} /></div>}
        </Panel>
      </ReactFlow>
    </div>
  );
};

const BoltzCanvas = (props: BoltzCanvasProps) => (
  <ReactFlowProvider>
    <BoltzCanvasInner {...props} />
  </ReactFlowProvider>
);

export default BoltzCanvas;