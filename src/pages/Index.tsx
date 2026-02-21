"use client";

import React, { useState, useEffect } from 'react';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import BoltzCanvas from '@/components/BoltzCanvas';
import Dashboard from '@/components/Dashboard';
import ReleaseNotes from '@/components/ReleaseNotes';
import Settings from '@/pages/Settings';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, editor, updates, settings
  const [selectedMapId, setSelectedMapId] = useState<string | undefined>(undefined);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | undefined>(undefined);

  // Escutar eventos de seleção de workspace vindos do Dashboard
  useEffect(() => {
    const handleWsSelect = (e: any) => {
      setActiveWorkspaceId(e.detail);
      setActiveView('dashboard');
    };
    window.addEventListener('select-workspace', handleWsSelect);
    return () => window.removeEventListener('select-workspace', handleWsSelect);
  }, []);

  const handleSelectMap = (id: string) => {
    setSelectedMapId(id);
    setActiveView('editor');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onSelectMap={handleSelectMap} workspaceId={activeWorkspaceId} />;
      case 'updates':
        return <ReleaseNotes />;
      case 'settings':
        return <Settings />;
      case 'editor':
        return <BoltzCanvas mapId={selectedMapId} onBack={() => setActiveView('dashboard')} />;
      default:
        return <Dashboard onSelectMap={handleSelectMap} workspaceId={activeWorkspaceId} />;
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
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;