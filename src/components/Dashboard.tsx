"use client";

import React, { useState, useEffect } from 'react';
import { Folder, FileText, MoreVertical, Plus, ChevronRight, Search, Trash2, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

interface DashboardProps {
  onSelectMap: (id: string) => void;
}

const Dashboard = ({ onSelectMap }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [maps, setMaps] = useState<any[]>([]);

  const fetchMaps = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('maps')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMaps(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar mapas:", error);
      // Se a tabela não existir ainda, mantemos a lista vazia
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const createNewMap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return showError("Sessão expirada.");

      const newMap = {
        title: `Novo Mapa ${maps.length + 1}`,
        user_id: user.id,
        content: { nodes: [], edges: [] }
      };

      const { data, error } = await supabase
        .from('maps')
        .insert([newMap])
        .select()
        .single();

      if (error) throw error;
      
      setMaps([data, ...maps]);
      showSuccess("Mapa criado com sucesso!");
      onSelectMap(data.id);
    } catch (error: any) {
      showError("Erro ao criar mapa. Verifique se a tabela 'maps' existe no Supabase.");
    }
  };

  const deleteMap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Deseja realmente excluir este mapa?")) return;

    try {
      const { error } = await supabase.from('maps').delete().eq('id', id);
      if (error) throw error;

      setMaps(maps.filter(m => m.id !== id));
      showSuccess("Mapa removido.");
    } catch (error: any) {
      showError("Erro ao excluir mapa.");
    }
  };

  const filteredMaps = maps.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Workspace</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-semibold">Projetos Ativos</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Meus Mapas</h1>
        </div>
        
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar mapas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50/50 focus:bg-white focus:border-blue-200 outline-none w-full md:w-72 transition-all"
            />
          </div>
          <button 
            onClick={createNewMap}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-blue-100"
          >
            <Plus size={20} />
            Criar Mapa
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-medium">Carregando seus projetos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMaps.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">Nenhum mapa encontrado. Comece criando um novo!</p>
            </div>
          )}
          
          {filteredMaps.map((map) => (
            <div 
              key={map.id}
              onClick={() => onSelectMap(map.id)}
              className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <FileText className="text-gray-400 group-hover:text-blue-600 transition-colors" size={28} />
                </div>
                <button 
                  onClick={(e) => deleteMap(map.id, e)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">{map.title}</h3>
              <p className="text-sm text-gray-400 font-medium">
                {new Date(map.updated_at || map.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;