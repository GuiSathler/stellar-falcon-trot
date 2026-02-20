"use client";

import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';

export function useMindMapHistory() {
  const [past, setPast] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    // Deep clone to avoid reference issues
    const snapshot = JSON.parse(JSON.stringify({ nodes, edges }));
    setPast((prev) => {
      // Don't save identical snapshots
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (JSON.stringify(last) === JSON.stringify(snapshot)) return prev;
      }
      return [...prev, snapshot].slice(-50);
    });
    setFuture([]);
  }, []);

  const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (past.length === 0) return null;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    const currentSnapshot = JSON.parse(JSON.stringify({ nodes: currentNodes, edges: currentEdges }));
    setFuture((prev) => [currentSnapshot, ...prev]);
    setPast(newPast);
    
    return previous;
  }, [past]);

  const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (future.length === 0) return null;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    const currentSnapshot = JSON.parse(JSON.stringify({ nodes: currentNodes, edges: currentEdges }));
    setPast((prev) => [...prev, currentSnapshot]);
    setFuture(newFuture);
    
    return next;
  }, [future]);

  return { undo, redo, takeSnapshot, canUndo: past.length > 0, canRedo: future.length > 0 };
}