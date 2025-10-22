'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
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

      {/* Footer - 25px height */}
      <div className="footer">Ready</div>

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
        }

        .footer {
          width: 100%;
          height: 25px;
          background: linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 100%);
          border-top: 1px solid #2a2a2a;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-size: 11px;
          color: #ccc;
        }
      `}</style>
    </div>
  );
}
