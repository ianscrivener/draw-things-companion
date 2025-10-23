'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import LogViewer from '@/components/LogViewer';
import StashesView from '@/components/views/StashesView';
import ModelsView from '@/components/views/ModelsView';
import LoRAsView from '@/components/views/LoRAsView';
import ControlNetsView from '@/components/views/ControlNetsView';
import EmbeddingsView from '@/components/views/EmbeddingsView';
import ProjectsView from '@/components/views/ProjectsView';
import ScriptsView from '@/components/views/ScriptsView';
import SettingsView from '@/components/views/SettingsView';

export default function Home() {
  const [activeSection, setActiveSection] = useState('models');

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  const renderView = () => {
    switch (activeSection) {
      case 'stashes':
        return <StashesView />;
      case 'models':
        return <ModelsView />;
      case 'loras':
        return <LoRAsView />;
      case 'controlnets':
        return <ControlNetsView />;
      case 'embeddings':
        return <EmbeddingsView />;
      case 'projects':
        return <ProjectsView />;
      case 'scripts':
        return <ScriptsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ModelsView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Body (2 columns) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation */}
        <Nav activeItem={activeSection} onNavigate={handleNavigate} />

        {/* Inner body - render active view */}
        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 pb-log-viewer">
          {renderView()}
        </div>
      </div>

      {/* Log Viewer Footer */}
      <LogViewer />
    </div>
  );
}
