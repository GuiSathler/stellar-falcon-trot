"use client";

import React, { useCallback, useEffect, useState } from 'react';
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
import { showSuccess } from '@/utils/toast';
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
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  
  const { fitView, getEdges, getNodes, setCenter } = useReactFlow();
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useMindMapHistory();
  const { loadMap, saveMap, isLoading, isSaving } = useMindMapPersistence(mapId);

  // Função centralizada para disparar o salvamento manual/baseado em evento
  const triggerSave = useCallback(() => {
    saveMap(getNodes(), getEdges());
  }, [saveMap, getNodes, getEdges]);

  const autoLayout = useCallback(() => {
    takeSnapshot(getNodes(), getEdges());
    
    setNodes((nds) => {
      const currentEdges = getEdges();
      const root = nds.find(n => !currentEdges.some(e => e.target === n.id));
      if (!root) return nds;

      const newNodes = [...nds];
      const horizontalSpacing = 450;
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

    setTimeout(() => {
      fitView({ duration: 800 });
      triggerSave();
    }, 100);
    showSuccess("Mapa organizado!");
  }, [getEdges, getNodes, setNodes, takeSnapshot, fitView, triggerSave]);

  const addChildNode = useCallback((parentId: string) => {
    takeSnapshot(getNodes(), getEdges());
    const newNodeId = uuidv4();
    
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      const currentEdges = getEdges();
      const children = currentEdges.filter(e => e.source === parentId);
      const childCount = children.length;
      
      const horizontalSpacing = 400;
      const verticalSpacing = 160;
      
      const offsetMultiplier = childCount % 2 === 0 ? (childCount / 2) : -((childCount + 1) / 2);
      const newY = parentNode.position.y + (offsetMultiplier * verticalSpacing);
      
      const newNode = {
        id: newNodeId,
        type: 'mindmap',
        data: { 
          label: '', 
          isNew: true,
          onAddChild: () => addChildNode(newNodeId),
          onSave: triggerSave,
        },
        position: { x: parentNode.position.x + horizontalSpacing, y: newY },
      };

      setTimeout(() => {
        setCenter(newNode.position.x + 100, newNode.position.y, { zoom: 1, duration: 800 });
      }, 50);

      return [...nds.map(n => ({ ...n, selected: false })), { ...newNode, selected: true }];
    });

    setEdges((eds) => {
      const newEdges = [...eds, {
        id: `e-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      }];
      return newEdges;
    });

    // Salva após a criação
    setTimeout(triggerSave, 200);
  }, [getEdges, setNodes, setEdges, takeSnapshot, setCenter, triggerSave]);

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
        setTimeout(triggerSave, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, addChildNode, addSiblingNode, triggerSave]);

  const hydrateNodes = useCallback((nodesToHydrate: Node[]) => {
    return nodesToHydrate.map((node) => ({
      ...node,
      data: {
        ...(node.data as MindMapNodeData),
        onAddChild: () => addChildNode(node.id),
        onSave: triggerSave,
      }
    }));
  }, [addChildNode, triggerSave]);

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
      setTimeout(triggerSave, 100);
    }
  };

  const handleRedo = () => {
    const next = redo(getNodes(), getEdges());
    if (next) {
      setNodes(hydrateNodes(next.nodes));
      setEdges(next.edges);
      setTimeout(triggerSave, 100);
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
        onSave: triggerSave,
      },
      position: { x: 100, y: 100 },
    };
    setNodes((nds) => [...nds.map(n => ({ ...n, selected: false })), { ...newNode, selected: true }]);
    setTimeout(triggerSave, 200);
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
        onNodeDragStop={() => {
          takeSnapshot(getNodes(), getEdges());
          triggerSave();
        }}
        onNodesDelete={() => setTimeout(triggerSave, 100)}
        onEdgesDelete={() => setTimeout(triggerSave, 100)}
        nodeTypes={nodeTypes}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        panOnDrag={[1, 2]}
        fitView
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#e5e7eb" 
        />
        
        <TopLeftPanel onBack={onBack} onSave={triggerSave} isSaving={isSaving} />

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