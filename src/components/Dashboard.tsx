"use client";

import React from 'react';
import { Folder, FileText, MoreVertical, Plus, ChevronRight, Search } from 'lucide-react';

interface DashboardProps {
  onSelectMap: (id: string) => void;
}

const Dashboard = ({ onSelectMap }: DashboardProps) => {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">Projetos 2024</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Mapas</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar mapas..." 
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm">
            <Plus size={18} />
            Novo Mapa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pastas */}
        <div className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Folder className="text-blue-600" size={24} />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={18} />
            </button>
          </div>
          <h3 className="font-semibold text-gray-900">Estratégia Q3</h3>
          <p className="text-xs text-gray-500">12 mapas • Atualizado há 2 dias</p>
        </div>

        {/* Mapas */}
        {['Estratégia de Produto', 'Arquitetura Boltz', 'User Journey'].map((map) => (
          <div 
            key={map}
            onClick={() => onSelectMap(map)}
            className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <FileText className="text-gray-400 group-hover:text-blue-600" size={24} />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={18} />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900">{map}</h3>
            <p className="text-xs text-gray-500">Modificado em 24 Mai 2024</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;