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
  Check,
  X,
  Loader2,
  MousePointer2
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
  
  const { fitView, getEdges, getNodes } = useReactFlow();
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
          onStartConnection: () => onStartConnection(newNodeId),
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

  const confirmAddRootNode = () => {
    if (!newRootName.trim()) return;
    takeSnapshot(getNodes(), getEdges());
    const id = uuidv4();
    const newNode = {
      id,
      type: 'mindmap',
      data: { 
        label: newRootName, 
        onAddChild: () => addChildNode(id),
        onStartConnection: () => onStartConnection(id),
        onNodeClick: (id: string) => handleNodeClick(id),
      },
      position: { x: 100, y: 100 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNewRootName('');
    setIsCreatingRoot(false);
    showSuccess("Nó principal criado!");
  };

  const autoLayout = () => {
    takeSnapshot(getNodes(), getEdges());
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    const newNodes = currentNodes.map((node) => {
      const incomingEdges = currentEdges.filter(e => e.target === node.id);
      if (incomingEdges.length === 0) return node; // Root node stays

      const parent = currentNodes.find(n => n.id === incomingEdges[0].source);
      if (!parent) return node;

      const siblings = currentEdges.filter(e => e.source === parent.id);
      const index = siblings.findIndex(e => e.target === node.id);
      const offset = (index - (siblings.length - 1) / 2) * 120;

      return {
        ...node,
        position: { x: parent.position.x + 300, y: parent.position.y + offset }
      };
    });

    setNodes(newNodes);
    showSuccess("Layout organizado!");
  };

  const exportToJson = () => {
    const data = { nodes: getNodes(), edges: getEdges() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindmap-${mapId || 'export'}.json`;
    link.click();
    showSuccess("Exportação concluída!");
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
      {nodes.length === 0 && !isCreatingRoot && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[40px] border-2 border-dashed border-blue-100 text-center animate-in zoom-in duration-500 pointer-events-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MousePointer2 size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Mapa Vazio</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[240px]">Comece adicionando o tópico central do seu mapa mental.</p>
            <button 
              onClick={() => setIsCreatingRoot(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 mx-auto"
            >
              <PlusCircle size={18} />
              Criar Tópico Inicial
            </button>
          </div>
        </div>
      )}

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
              {isCreatingRoot && isMenuOpen ? (
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 mb-2 animate-in slide-in-from-top-2">
                  <input 
                    autoFocus
                    className="w-full p-2 text-xs rounded-lg border border-blue-200 outline-none mb-2"
                    placeholder="Nome do tópico..."
                    value={newRootName}
                    onChange={(e) => setNewRootName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmAddRootNode()}
                  />
                  <div className="flex gap-1">
                    <button onClick={confirmAddRootNode} className="flex-1 bg-blue-600 text-white p-1.5 rounded-lg flex justify-center"><Check size={14} /></button>
                    <button onClick={() => setIsCreatingRoot(false)} className="flex-1 bg-white text-gray-400 p-1.5 rounded-lg border border-gray-200 flex justify-center"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsCreatingRoot(true)} className="flex items-center gap-2.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md mb-2">
                  <PlusCircle size={18} />
                  {isMenuOpen && <span className="text-xs font-bold">Novo Pai</span>}
                </button>
              )}
              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl"><Sparkles size={18} className="text-amber-400" />{isMenuOpen && <span className="text-xs font-medium">Sugerir IA</span>}</button>
              <button onClick={autoLayout} className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl"><Layout size={18} className="text-indigo-400" />{isMenuOpen && <span className="text-xs font-medium">Organizar</span>}</button>
              <button onClick={exportToJson} className="flex items-center gap-2.5 p-2 text-gray-500 hover:bg-gray-50 rounded-xl mt-auto"><Download size={18} />{isMenuOpen && <span className="text-xs font-medium">Exportar</span>}</button>
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