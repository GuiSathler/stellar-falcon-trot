"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  SelectionMode,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindMapNode, { MindMapNodeData } from './MindMapNode';
import { v4 as uuidv4 } from 'uuid';
import { showSuccess, showError } from '@/utils/toast';
import { 
  PlusCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Map as MapIcon,
  Loader2,
  LayoutTemplate,
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
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false); // Começa fechado para não poluir
  
  const { fitView, getEdges, getNodes, setCenter } = useReactFlow();
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useMindMapHistory();
  const { loadMap, saveMap, isLoading, isSaving } = useMindMapPersistence(mapId);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Salvamento Automático
  useEffect(() => {
    if (nodes.length === 0 || isLoading) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      saveMap(nodes, edges);
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [nodes, edges, saveMap, isLoading]);

  // Função de Auto-Layout (Organização Inteligente)
  const autoLayout = useCallback(() => {
    takeSnapshot(getNodes(), getEdges());
    
    setNodes((nds) => {
      const currentEdges = getEdges();
      const root = nds.find(n => !currentEdges.some(e => e.target === n.id));
      if (!root) return nds;

      const newNodes = [...nds];
      const horizontalSpacing = 450; // Aumentado para evitar sobreposição de texto longo
      const verticalSpacing = 180;

      const layout = (parentId: string, x: number, y: number) => {
        const children = currentEdges.filter(e => e.source === parentId).map(e => e.target);
        const nodeIdx = newNodes.findIndex(n => n.id === parentId);
        if (nodeIdx !== -1) {
          newNodes[nodeIdx] = { ...newNodes[nodeIdx], position: { x, y } };
        }

        const totalHeight = (children.length - 1) * verticalSpacing;
        let currentY = y - totalHeight / 2;

        children.forEach(childId => {
          layout(childId, x + horizontalSpacing, currentY);
          currentY += verticalSpacing;
        });
      };

      layout(root.id, root.position.x, root.position.y);
      return newNodes;
    });

    setTimeout(() => fitView({ duration: 800 }), 100);
    showSuccess("Mapa organizado!");
  }, [getEdges, getNodes, setNodes, takeSnapshot, fitView]);

  const addChildNode = useCallback((parentId: string) => {
    takeSnapshot(getNodes(), getEdges());
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      const currentEdges = getEdges();
      const children = currentEdges.filter(e => e.source === parentId);
      const childCount = children.length;
      
      // Lógica de posicionamento em leque para evitar sobreposição
      const horizontalSpacing = 400;
      const verticalSpacing = 160;
      
      // Calcula o deslocamento vertical baseado no número de filhos existentes
      // Alterna entre cima e baixo para manter o equilíbrio
      const offsetMultiplier = childCount % 2 === 0 ? (childCount / 2) : -((childCount + 1) / 2);
      const newY = parentNode.position.y + (offsetMultiplier * verticalSpacing);
      
      const newNode = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: '', 
          isNew: true,
          onAddChild: () => addChildNode(newNodeId),
        },
        position: { x: parentNode.position.x + horizontalSpacing, y: newY },
      };

      setTimeout(() => {
        setCenter(newNode.position.x + 100, newNode.position.y, { zoom: 1, duration: 800 });
      }, 50);

      return [...nds.map(n => ({ ...n, selected: false })), { ...newNode, selected: true }];
    });

    setEdges((eds) => [...eds, {
      id: `e-${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    }]);
  }, [getEdges, setNodes, setEdges, takeSnapshot, setCenter]);

  const addSiblingNode = useCallback((nodeId: string) => {
    const edge = getEdges().find(e => e.target === nodeId);
    if (edge) {
      addChildNode(edge.source);
    } else {
      addRootNode();
    }
  }, [getEdges, addChildNode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedNode = getNodes().find(n => n.selected);
      const isInputActive = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

      if (isInputActive && e.key !== 'Escape') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (!selectedNode) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        addChildNode(selectedNode.id);
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addSiblingNode(selectedNode.id);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        takeSnapshot(getNodes(), getEdges());
        setNodes(nds => nds.filter(n => !n.selected));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, addChildNode, addSiblingNode]);

  const hydrateNodes = useCallback((nodesToHydrate: Node[]) => {
    return nodesToHydrate.map((node) => ({
      ...node,
      data: {
        ...(node.data as MindMapNodeData),
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
    setNodes((nds) => [...nds.map(n => ({ ...n, selected: false })), { ...newNode, selected: true }]);
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
        {/* Fundo Miro-Style: Grade de pontos sutil */}
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#e5e7eb" 
        />
        
        <TopLeftPanel onBack={onBack} onSave={() => saveMap(getNodes(), getEdges())} isSaving={isSaving} />

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
                onClick={autoLayout}
                className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                <LayoutTemplate size={18} className="text-blue-500" />
                {isMenuOpen && <span className="text-xs font-medium">Auto-Alinhar</span>}
              </button>

              <button className="flex items-center gap-2.5 p-2 text-gray-600 hover:bg-gray-50 rounded-xl">
                <Sparkles size={18} className="text-amber-400" />
                {isMenuOpen && <span className="text-xs font-medium">Sugerir IA</span>}
              </button>
            </div>
          </div>
        </Panel>

        <BottomLeftPanel onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo} />

        {/* MiniMap no canto inferior direito com botão de toggle */}
        <Panel position="bottom-right" className="m-6 flex flex-col items-end gap-3">
          {isMiniMapOpen && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <MiniMap 
                style={{ width: 200, height: 140 }} 
                maskColor="rgba(243, 244, 246, 0.6)"
                nodeColor="#3b82f6"
              />
            </div>
          )}
          <button 
            onClick={() => setIsMiniMapOpen(!isMiniMapOpen)} 
            className={cn(
              "w-12 h-12 bg-white border border-gray-100 rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95",
              isMiniMapOpen ? "text-blue-600 border-blue-100" : "text-gray-400 hover:text-blue-600"
            )}
          >
            <MapIcon size={20} />
          </button>
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