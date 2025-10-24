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
  // { id: 'stashes', icon: BriefcaseBusiness, label: 'Stashes' },
  { id: 'models', icon: Image, label: 'Models' },
  { id: 'loras', icon: SquarePen, label: 'LoRAs' },
  { id: 'controlnets', icon: Factory, label: 'ControlNets' },
  // { id: 'embeddings', icon: ArchiveRestore, label: 'Embeddings' },
  // { id: 'projects', icon: Presentation, label: 'Projects' },
  // { id: 'scripts', icon: FileJson2, label: 'Scripts' },
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
    <nav className="w-[80px] h-full bg-gray-100 border-r border-gray-300 flex flex-col pt-lg">
      {navItems.map(({ id, icon: Icon, label }) => (
        <div
          key={id}
          className={`
            flex flex-col items-center px-2 py-3 cursor-pointer
            transition-colors duration-200 text-base font-medium text-gray-800 text-center
            hover:bg-gray-200
            ${active === id ? 'text-brand font-bold' : ''}
          `}
          onClick={() => handleClick(id)}
        >
          <Icon
            className={`mb-1 ${active === id ? 'text-brand' : 'text-gray-800'}`}
            size={20}
            strokeWidth={1.5}
          />
          <div>{label}</div>
        </div>
      ))}
    </nav>
  );
}
