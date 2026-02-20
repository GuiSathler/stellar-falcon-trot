"use client";

import React, { useState } from 'react';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import BoltzCanvas from '@/components/BoltzCanvas';
import Dashboard from '@/components/Dashboard';
import ReleaseNotes from '@/components/ReleaseNotes';
import Settings from '@/pages/Settings';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, editor, updates, settings
  const [selectedMapId, setSelectedMapId] = useState<string | undefined>(undefined);

  const handleSelectMap = (id: string) => {
    setSelectedMapId(id);
    setActiveView('editor');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
      case 'workspace':
        return <Dashboard onSelectMap={handleSelectMap} />;
      case 'updates':
        return <ReleaseNotes />;
      case 'settings':
        return <Settings />;
      case 'editor':
        return <BoltzCanvas mapId={selectedMapId} onBack={() => setActiveView('dashboard')} />;
      default:
        return <Dashboard onSelectMap={handleSelectMap} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <WorkspaceSidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          if (view !== 'editor') setSelectedMapId(undefined);
        }} 
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto bg-white">
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