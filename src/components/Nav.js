'use client';

import { useState } from 'react';
import {
  BriefcaseBusiness,
  Image,
  SquarePen,
  Factory,
  ArchiveRestore,
  Presentation,
  FileJson2,
  Settings
} from 'lucide-react';

const navItems = [
  { id: 'stashes', icon: BriefcaseBusiness, label: 'Stashes' },
  { id: 'models', icon: Image, label: 'Models' },
  { id: 'loras', icon: SquarePen, label: 'LoRAs' },
  { id: 'controlnets', icon: Factory, label: 'ControlNets' },
  { id: 'embeddings', icon: ArchiveRestore, label: 'Embeddings' },
  { id: 'projects', icon: Presentation, label: 'Projects' },
  { id: 'scripts', icon: FileJson2, label: 'Scripts' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

export default function Nav({ activeItem = 'models', onNavigate }) {
  const [active, setActive] = useState(activeItem);

  const handleClick = (itemId) => {
    setActive(itemId);
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <nav className="nav">
      {navItems.map(({ id, icon: Icon, label }) => (
        <div
          key={id}
          className={`nav-item ${active === id ? 'active' : ''}`}
          onClick={() => handleClick(id)}
        >
          <Icon className="nav-icon" size={24} strokeWidth={2} />
          <div>{label}</div>
        </div>
      ))}

      <style jsx>{`
        .nav {
          width: 90px;
          height: 100%;
          background-color: #f5f5f5;
          border-right: 1px solid #d0d0d0;
          display: flex;
          flex-direction: column;
          padding-top: 20px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 13px;
          font-weight: 450;
          color: #333;
          text-align: center;
        }

        .nav-item:hover {
          background-color: #e8e8e8;
        }

        .nav-item :global(.nav-icon) {
          margin-bottom: 4px;
          color: #333;
        }

        .nav-item.active {
          color: #ff5f57;
          font-weight: 600;
        }

        .nav-item.active :global(.nav-icon) {
          color: #ff5f57;
        }
      `}</style>
    </nav>
  );
}
