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
  const { initialized, loading, needsSetup, initializeApp } = useAppInitialization();

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  const handleSetupComplete = async (dtBaseDir, stashDir) => {
    return await initializeApp(dtBaseDir, stashDir);
  };

  // Show setup wizard if not initialized
  if (needsSetup && !initialized) {
    return (
      <>
        <SetupWizard onComplete={handleSetupComplete} />
        <LogViewer />
      </>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading DrawThings Companion...</p>
          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding-bottom: 35px; /* Make room for log viewer */
            }
            .loading-spinner {
              width: 48px;
              height: 48px;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            p {
              margin-top: 20px;
              font-size: 16px;
            }
          `}</style>
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
    <div className="main">
      {/* Body (2 columns) */}
      <div className="body">
        {/* Navigation */}
        <Nav activeItem={activeSection} onNavigate={handleNavigate} />

        {/* Inner body - render active view */}
        <div className="inner_body">
          {renderView()}
        </div>
      </div>

      {/* Log Viewer Footer */}
      <LogViewer />

      <style jsx>{`
        .main {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
        }

        .body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .inner_body {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          background: #fafafa;
          padding-bottom: 35px; /* Make room for log viewer */
        }
      `}</style>
    </div>
  );
}
