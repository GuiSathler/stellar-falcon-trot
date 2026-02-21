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
import { showSuccess, showError } from '@/utils/toast';
import { 
  PlusCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Map as MapIcon,
  Loader2,
  LayoutTemplate,
  Palette,
  Wand2,
  Download,
  Settings2
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
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  
  const { fitView, getEdges, getNodes, setCenter } = useReactFlow();
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useMindMapHistory();
  const { loadMap, saveMap, isLoading, isSaving } = useMindMapPersistence(mapId);

  const triggerSave = useCallback(() => {
    saveMap(getNodes(), getEdges());
  }, [saveMap, getNodes, getEdges]);

  const autoLayout = useCallback(() => {
    if (!confirm("Isso reorganizará todo o seu mapa. Deseja continuar? Você pode desfazer se não gostar.")) return;
    
    takeSnapshot(getNodes(), getEdges());
    
    setNodes((nds) => {
      const currentEdges = getEdges();
      const root = nds.find(n => !currentEdges.some(e => e.target === n.id));
      if (!root) return nds;

      const newNodes = [...nds];
      const horizontalSpacing = 300;
      const verticalSpacing = 120;

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
      showSuccess("Mapa organizado! Use Ctrl+Z para desfazer.");
    }, 100);
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
      
      const horizontalSpacing = 250;
      const verticalSpacing = 100;
      
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
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      }];
      return newEdges;
    });

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
        minZoom={0.1}
        maxZoom={2}
        fitView
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1} 
          color="#e5e7eb" 
        />
        
        <TopLeftPanel onBack={onBack} onSave={triggerSave} isSaving={isSaving} />

        {/* Menu Lateral Direito Refatorado */}
        <Panel position="top-right" className="h-[calc(100%-3rem)] flex items-center pointer-events-none m-6">
          <div className={cn(
            "bg-white border border-gray-100 shadow-2xl rounded-[32px] transition-all duration-500 pointer-events-auto flex flex-col overflow-hidden",
            isRightPanelOpen ? "w-64 p-6" : "w-14 p-2"
          )}>
            <div className="flex items-center justify-between mb-8">
              {isRightPanelOpen && <span className="text-xs font-black uppercase tracking-widest text-gray-400">Ferramentas</span>}
              <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} 
                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
              >
                {isRightPanelOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={addRootNode} 
                className={cn(
                  "flex items-center gap-3 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95",
                  !isRightPanelOpen && "justify-center"
                )}
              >
                <PlusCircle size={20} />
                {isRightPanelOpen && <span className="text-sm font-bold">Novo Tópico</span>}
              </button>

              <div className="h-px bg-gray-100 my-2" />

              <ToolButton 
                icon={LayoutTemplate} 
                label="Auto-Alinhar" 
                onClick={autoLayout} 
                isOpen={isRightPanelOpen} 
                color="text-blue-500"
              />
              
              <ToolButton 
                icon={Wand2} 
                label="Sugerir com IA" 
                onClick={() => showError("IA disponível em breve!")} 
                isOpen={isRightPanelOpen} 
                color="text-amber-500"
              />

              <ToolButton 
                icon={Palette} 
                label="Temas Visuais" 
                onClick={() => {}} 
                isOpen={isRightPanelOpen} 
                color="text-indigo-500"
              />

              <ToolButton 
                icon={Download} 
                label="Exportar Mapa" 
                onClick={() => {}} 
                isOpen={isRightPanelOpen} 
                color="text-emerald-500"
              />

              <div className="mt-auto pt-4">
                <ToolButton 
                  icon={Settings2} 
                  label="Preferências" 
                  onClick={() => {}} 
                  isOpen={isRightPanelOpen} 
                  color="text-gray-400"
                />
              </div>
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

const ToolButton = ({ icon: Icon, label, onClick, isOpen, color }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 p-2.5 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all group",
      !isOpen && "justify-center"
    )}
  >
    <Icon size={20} className={cn("transition-colors", color)} />
    {isOpen && <span className="text-sm font-bold group-hover:text-gray-900">{label}</span>}
  </button>
);

const BoltzCanvas = (props: BoltzCanvasProps) => (
  <ReactFlowProvider>
    <BoltzCanvasInner {...props} />
  </ReactFlowProvider>
);

export default BoltzCanvas;