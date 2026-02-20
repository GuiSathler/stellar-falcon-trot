"use client";

import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

export function useMindMapHistory() {
  const [past, setPast] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    setPast((prev) => [...prev, { nodes, edges }].slice(-50));
    setFuture([]);
  }, []);

  const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture((prev) => [{ nodes: currentNodes, edges: currentEdges }, ...prev]);
    setPast(newPast);
    return previous;
  }, [past]);

  const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (future.length === 0) return null;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast((prev) => [...prev, { nodes: currentNodes, edges: currentEdges }]);
    setFuture(newFuture);
    return next;
  }, [future]);

  return { undo, redo, takeSnapshot, canUndo: past.length > 0, canRedo: future.length > 0 };
}