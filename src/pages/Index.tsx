"use client";

import React from 'react';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import BoltzCanvas from '@/components/BoltzCanvas';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar de Gerenciamento */}
      <WorkspaceSidebar />

      {/* Área Principal do Mapa Mental */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-800">Estratégia de Produto 2024</h2>
            <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">Salvo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                  U{i}
                </div>
              ))}
            </div>
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
              Compartilhar
            </button>
          </div>
        </header>

        <div className="flex-1 relative">
          <BoltzCanvas />
        </div>
        
        <div className="absolute bottom-4 right-4 z-20">
          <MadeWithDyad />
        </div>
      </main>
    </div>
  );
};

export default Index;