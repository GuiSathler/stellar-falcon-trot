"use client";

import React, { useState } from 'react';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import BoltzCanvas from '@/components/BoltzCanvas';
import Dashboard from '@/components/Dashboard';
import ReleaseNotes from '@/components/ReleaseNotes';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, editor, updates

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
      case 'workspace':
        return <Dashboard onSelectMap={() => setActiveView('editor')} />;
      case 'updates':
        return <ReleaseNotes />;
      case 'editor':
        return <BoltzCanvas />;
      default:
        return <Dashboard onSelectMap={() => setActiveView('editor')} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <WorkspaceSidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 flex flex-col relative overflow-y-auto bg-white">
        {activeView === 'editor' && (
          <header className="h-14 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                Voltar
              </button>
              <h2 className="font-semibold text-gray-800">Estratégia de Produto 2024</h2>
              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">Salvo</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
                Compartilhar
              </button>
            </div>
          </header>
        )}

        <div className="flex-1 relative">
          {renderContent()}
        </div>
        
        <div className="absolute bottom-4 right-4 z-20">
          <MadeWithDyad />
        </div>
      </main>
    </div>
  );
};

export default Index;