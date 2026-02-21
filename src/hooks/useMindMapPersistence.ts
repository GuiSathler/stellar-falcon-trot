"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Node, Edge } from '@xyflow/react';
import { showError } from '@/utils/toast';

export function useMindMapPersistence(mapId?: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!mapId);

  const loadMap = useCallback(async () => {
    if (!mapId) return null;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('maps')
        .select('content')
        .eq('id', mapId)
        .single();

      if (error) throw error;
      return data?.content || { nodes: [], edges: [] };
    } catch (error) {
      showError("Erro ao carregar mapa.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  const saveMap = useCallback(async (nodes: Node[], edges: Edge[]) => {
    if (!mapId) return;
    setIsSaving(true);
    try {
      // Remove functions before saving
      const nodesToSave = nodes.map(({ data, ...rest }) => {
        const { onAddChild, onStartConnection, onNodeClick, ...serializableData } = data;
        return { ...rest, data: serializableData };
      });

      const { error } = await supabase
        .from('maps')
        .update({ 
          content: { nodes: nodesToSave, edges },
          updated_at: new Date().toISOString()
        })
        .eq('id', mapId);

      if (error) throw error;
      // Toast removido para evitar excesso de notificações
    } catch (error) {
      showError("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  }, [mapId]);

  return { loadMap, saveMap, isLoading, isSaving };
}