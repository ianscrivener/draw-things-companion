'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import SetupWizard from '@/components/SetupWizard';
import LogViewer from '@/components/LogViewer';
import StashesView from '@/components/views/StashesView';
import ModelsView from '@/components/views/ModelsView';
import LoRAsView from '@/components/views/LoRAsView';
import ControlNetsView from '@/components/views/ControlNetsView';
import EmbeddingsView from '@/components/views/EmbeddingsView';
import ProjectsView from '@/components/views/ProjectsView';
import ScriptsView from '@/components/views/ScriptsView';
import SettingsView from '@/components/views/SettingsView';
import { useAppInitialization } from '../hooks/useAppInitialization';

export default function Home() {
  const [activeSection, setActiveSection] = useState('models');
  const { initialized, loading, needsSetup, error, initializeApp } = useAppInitialization();

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  const handleSetupComplete = async (dtBaseDir, stashDir) => {
    return await initializeApp(dtBaseDir, stashDir);
  };

  // Show loading state (highest priority)
  if (loading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-brand text-white pb-log-viewer">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="mt-5 text-lg">Loading DrawThings Companion...</p>
        </div>
        <LogViewer />
      </>
    );
  }

  // Show setup wizard if setup is needed
  if (needsSetup) {
    return (
      <>
        <SetupWizard onComplete={handleSetupComplete} />
        <LogViewer />
      </>
    );
  }

  // Show error state if initialization failed
  if (error && !initialized) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-brand text-white pb-log-viewer">
          <div className="text-error text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Initialization Error</h1>
          <p className="text-lg mb-6 max-w-md text-center">{error}</p>
          <button
            className="px-6 py-3 bg-white text-gray-900 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
        <LogViewer />
      </>
    );
  }

  // Safety check - if not initialized and not loading/setup/error, show loading
  if (!initialized) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-brand text-white pb-log-viewer">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="mt-5 text-lg">Initializing...</p>
        </div>
        <LogViewer />
      </>
    );
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
