"use client";

import React, { useState, useEffect } from 'react';
import { Folder, FileText, MoreVertical, Plus, ChevronRight, Search, Trash2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

interface DashboardProps {
  onSelectMap: (id: string) => void;
}

const Dashboard = ({ onSelectMap }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [maps, setMaps] = useState([
    { id: uuidv4(), title: 'Estratégia de Produto', date: '24 Mai 2024' },
    { id: uuidv4(), title: 'Arquitetura Boltz', date: '22 Mai 2024' },
    { id: uuidv4(), title: 'User Journey', date: '20 Mai 2024' },
  ]);

  // Fetch user ID to prepare for RLS-compliant queries
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const filteredMaps = maps.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const createNewMap = () => {
    // NOTE: When persisting to DB, ensure user_id is included for RLS compliance
    const newMap = {
      id: uuidv4(),
      title: `Novo Mapa ${maps.length + 1}`,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      user_id: userId // Prepared for future persistence
    };
    setMaps([newMap, ...maps]);
    showSuccess("Novo mapa criado!");
  };

  const deleteMap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // NOTE: When persisting to DB, RLS will prevent unauthorized deletions,
    // but we should still verify ownership in the query: .eq('id', id).eq('user_id', userId)
    setMaps(maps.filter(m => m.id !== id));
    showSuccess("Mapa removido.");
  };

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
              placeholder="Pesquisar em tudo..." 
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-start justify-between mb-6 relative">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <Folder className="text-white" size={28} />
            </div>
            <button className="text-gray-300 hover:text-gray-600 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
          <h3 className="font-bold text-xl text-gray-900 mb-1">Estratégia Q3</h3>
          <p className="text-sm text-gray-400 font-medium">12 mapas arquivados</p>
        </div>

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
            <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{map.title}</h3>
            <p className="text-sm text-gray-400 font-medium">Editado em {map.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;