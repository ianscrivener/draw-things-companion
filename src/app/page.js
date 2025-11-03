'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import LogViewer from '@/components/LogViewer';
import SetupWizard from '@/components/SetupWizard';
import { useAppInitialization } from '@/hooks/useAppInitialization';
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
  const { initialized, loading, needsSetup, initializeApp } = useAppInitialization();

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  // Show loading state while checking initialization
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading DrawThings Companion...</div>
          <div className="text-sm text-gray-600">Checking initialization status</div>
        </div>
      </div>
    );
  }

  // Show setup wizard if app needs first-run setup
  if (needsSetup) {
    return <SetupWizard onComplete={initializeApp} />;
  }

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
