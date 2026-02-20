"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Plus, ChevronRight, Search, Trash2, Loader2, Crown } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from './PermissionGate';

interface DashboardProps {
  onSelectMap: (id: string) => void;
}

const Dashboard = ({ onSelectMap }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [maps, setMaps] = useState<any[]>([]);
  const { profile } = usePermissions();

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const createNewMap = async () => {
    if (profile?.plan_type === 'free' && maps.length >= 3) {
      return showError("Limite de 3 mapas atingido no plano Free. Faça upgrade!");
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('maps')
        .insert([{ title: `Novo Mapa ${maps.length + 1}`, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setMaps([data, ...maps]);
      showSuccess("Mapa criado!");
      onSelectMap(data.id);
    } catch (error: any) {
      showError(error.message || "Erro ao criar mapa.");
    }
  };

  const filteredMaps = maps.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-semibold">Projetos</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Meus Mapas
            {profile?.plan_type === 'pro' && (
              <span className="bg-amber-100 text-amber-600 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Crown size={12} /> PRO
              </span>
            )}
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none w-full md:w-64"
            />
          </div>
          <button 
            onClick={createNewMap}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <Plus size={20} />
            Novo Mapa
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredMaps.map((map) => (
            <div 
              key={map.id}
              onClick={() => onSelectMap(map.id)}
              className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <FileText className="text-gray-400 group-hover:text-blue-600" size={28} />
                </div>
                <PermissionGate action="delete" mapOwnerId={map.user_id}>
                  <button className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </PermissionGate>
              </div>
              <h3 className="font-bold text-xl text-gray-900 truncate">{map.title}</h3>
              <p className="text-sm text-gray-400 mt-1">Atualizado em {new Date(map.updated_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;