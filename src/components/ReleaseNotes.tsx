"use client";

import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';

const updates = [
  {
    version: "v1.2.0",
    date: "24 Mai 2024",
    title: "Workspace Avançado",
    description: "Implementação de pastas aninhadas e sistema de gerenciamento de arquivos."
  },
  {
    version: "v1.1.0",
    date: "20 Mai 2024",
    title: "Motor de Canvas Pro",
    description: "Melhoria na performance do grafo e adição de atalhos rápidos para criação de nós."
  }
];

const ReleaseNotes = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sparkles className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notas de Atualização</h2>
          <p className="text-sm text-gray-500">Acompanhe as últimas melhorias no Boltz Flow</p>
        </div>
      </div>

      <div className="space-y-6">
        {updates.map((update) => (
          <div key={update.version} className="relative pl-8 border-l-2 border-blue-100 pb-6">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                {update.version}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={12} />
                {update.date}
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{update.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{update.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleaseNotes;