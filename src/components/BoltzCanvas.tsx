"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
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
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Download,
  Map as MapIcon,
  Loader2,
  History,
  RotateCcw,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMindMapHistory } from '@/hooks/useMindMapHistory';
import { useMindMapPersistence } from '@/hooks/useMindMapPersistence';
import { TopLeftPanel } from './canvas/TopLeftPanel';
import { BottomLeftPanel } from './canvas/BottomLeftPanel';
import { supabase } from '@/lib/supabase';

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
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  
  const { fitView, getEdges, getNodes, setCenter, zoomTo } = useReactFlow();
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useMindMapHistory();
  const { loadMap, saveMap, isLoading, isSaving } = useMindMapPersistence(mapId);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, past]);

  const addChildNode = useCallback((parentId: string) => {
    takeSnapshot(getNodes(), getEdges());
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      // Cálculo de posição sem sobreposição
      const children = getEdges().filter(e => e.source === parentId);
      const offset = children.length * 100 - (children.length * 50);
      
      const newNode = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: '', 
          isNew: true,
          onAddChild: () => addChildNode(newNodeId),
        },
        position: { x: parentNode.position.x + 350, y: parentNode.position.y + offset },
      };

      // Focar no novo nó
      setTimeout(() => {
        setCenter(newNode.position.x + 100, newNode.position.y, { zoom: 1, duration: 800 });
      }, 50);

      return [...nds, newNode];
    });

    setEdges((eds) => [...eds, {
      id: `e-${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    }]);
  }, [getEdges, setNodes, setEdges, takeSnapshot, setCenter]);

  const hydrateNodes = useCallback((nodesToHydrate: Node[]) => {
    return nodesToHydrate.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onAddChild: () => addChildNode(node.id),
      }
    }));
  }, [addChildNode]);

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

  const addRootNode = () => {
    takeSnapshot(getNodes(), getEdges());
    const id = uuidv4();
    const newNode = {
      id,
      type: 'mindmap',
      data: { 
        label: '', 
        isNew: true,
        onAddChild: () => addChildNode(id),
      },
      position: { x: 100, y: 100 },
    };
    setNodes((nds) => [...nds, newNode]);
    setCenter(100, 100, { zoom: 1, duration: 800 });
  };

  const fetchVersions = async () => {
    if (!mapId) return;
    const { data } = await supabase
      .from('map_versions')
      .select('*')
      .eq('map_id', mapId)
      .order('created_at', { ascending: false });
    setVersions(data || []);
  };

  const saveVersion = async () => {
    if (!mapId) return;
    const { data: { user } } = await supabase.auth.getUser();
    const content = { nodes: getNodes(), edges: getEdges() };
    
    const { error } = await supabase
      .from('map_versions')
      .insert([{ map_id: mapId, content, user_id: user?.id }]);
    
    if (!error) {
      showSuccess("Versão salva com sucesso!");
      fetchVersions();
    }
  };

  const restoreVersion = (version: any) => {
    takeSnapshot(getNodes(), getEdges());
    setNodes(hydrateNodes(version.content.nodes));
    setEdges(version.content.edges);
    showSuccess("Versão restaurada!");
    setIsVersionsOpen(false);
  };

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  if (isLoading) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-gray-500 font-bold">Carregando seu mapa...</p>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#fcfcfc] relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={() => takeSnapshot(getNodes(), getEdges())}
        nodeTypes={nodeTypes}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        panOnDrag={[1, 2]}
        fitView
      >
        <Background color="#f1f1f1" gap={40} size={1} />
        
        <TopLeftPanel onBack={onBack} onSave={() => { saveMap(getNodes(), getEdges()); saveVersion(); }} isSaving={isSaving} />

        <Panel position="top-right" className="h-[calc(100%-2rem)] flex items-center pointer-events-none">
          <div className={cn("bg-white border border-gray-100 shadow-2xl rounded-2xl transition-all pointer-events-auto flex flex-col overflow-hidden", isMenuOpen ? "w-52 p-3" : "w-12 p-2")}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mb-4 p-1.5 hover:bg-gray-50 rounded-lg self-end">
              {isMenuOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <div className={cn("flex flex-col gap-1.5", !isMenuOpen && "items-center")}>
              <button onClick={addRootNode} className="flex items-center gap-2.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md mb-2">
                <PlusCircle size={18} />
                {isMenuOpen && <span className="text-xs font-bold">Novo Tópico</span>}
              </button>
              
              <button 
                onClick={() => { setIsVersionsOpen(true); fetchVersions(); }}
                className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                <History size={18} className="text-blue-400" />
                {isMenuOpen && <span className="text-xs font-medium">Histórico</span>}
              </button>

              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl">
                <Sparkles size={18} className="text-amber-400" />
                {isMenuOpen && <span className="text-xs font-medium">Sugerir IA</span>}
              </button>
            </div>
          </div>
        </Panel>

        {/* Painel de Versões */}
        {isVersionsOpen && (
          <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-gray-100 shadow-2xl z-[100] animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-gray-900">Histórico de Versões</h3>
              <button onClick={() => setIsVersionsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
              {versions.map((v) => (
                <div key={v.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Snapshot Automático</span>
                    <button 
                      onClick={() => restoreVersion(v)}
                      className="p-2 bg-white text-blue-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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