"use client";

import React from 'react';
import { Sparkles, Calendar, Zap, Shield, MousePointer2 } from 'lucide-react';

const updates = [
  {
    version: "v1.3.0",
    date: "Hoje",
    title: "Interatividade Total & Engine v3",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50",
    details: [
      "Edição Inline: Clique duplo em qualquer nó para renomear instantaneamente.",
      "Algoritmo de Funil: Novo sistema de posicionamento automático que organiza filhos em cascata vertical.",
      "Exportação Pro: Agora você pode baixar seus mapas em formato JSON para backup.",
      "Gestão de Ciclo de Vida: Adicionado suporte para exclusão de nós e mapas no dashboard."
    ]
  },
  {
    version: "v1.2.0",
    date: "24 Mai 2024",
    title: "Workspace Reativo",
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-50",
    details: [
      "Sistema de busca em tempo real implementado no Dashboard.",
      "Sidebar inteligente com estados de colapso persistentes.",
      "Otimização de renderização para mapas com mais de 100 nós."
    ]
  }
];

const ReleaseNotes = () => {
  return (
    <div className="p-10 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100">
          <Sparkles className="text-white" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">O que há de novo?</h2>
          <p className="text-gray-500 font-medium">Evoluindo o Boltz Flow a cada commit.</p>
        </div>
      </div>

      <div className="space-y-12">
        {updates.map((update) => (
          <div key={update.version} className="relative pl-12 border-l-4 border-gray-100">
            <div className={`absolute -left-[14px] top-0 p-2 rounded-xl ${update.bg} ${update.color} shadow-sm border-4 border-white`}>
              <update.icon size={16} />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${update.bg} ${update.color}`}>
                  {update.version}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-gray-400 font-bold">
                  <Calendar size={14} />
                  {update.date}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{update.title}</h3>
            </div>

            <ul className="space-y-3">
              {update.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-sm font-medium">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleaseNotes;