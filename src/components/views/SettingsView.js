'use client';

import { useState } from 'react';
import { Settings, Folder, Database, Bell, Palette, Shield, Info } from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    drawThingsPath: '~/Library/Containers/com.liuliu.draw-things/Data/Documents',
    databasePath: '~/Library/Application Support/DrawThingsCompanion/data.db',
    notifications: true,
    autoBackup: true,
    theme: 'light'
  });

  const settingsSections = [
    {
      id: 'paths',
      title: 'Paths & Locations',
      icon: Folder,
      items: [
        {
          label: 'DrawThings Directory',
          value: settings.drawThingsPath,
          type: 'path'
        },
        {
          label: 'Database Location',
          value: settings.databasePath,
          type: 'path'
        }
      ]
    },
    {
      id: 'database',
      title: 'Database',
      icon: Database,
      items: [
        {
          label: 'Auto Backup',
          value: settings.autoBackup,
          type: 'toggle'
        },
        {
          label: 'Backup Location',
          value: '~/Backups/DrawThingsCompanion',
          type: 'path'
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Theme',
          value: settings.theme,
          type: 'select',
          options: ['light', 'dark', 'auto']
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Enable Notifications',
          value: settings.notifications,
          type: 'toggle'
        }
      ]
    },
    {
      id: 'about',
      title: 'About',
      icon: Info,
      items: [
        {
          label: 'Version',
          value: '1.0.0',
          type: 'readonly'
        },
        {
          label: 'Tauri Version',
          value: '2.8.5',
          type: 'readonly'
        }
      ]
    }
  ];

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <Settings size={28} />
          <h1>Settings</h1>
        </div>
      </div>

      <div className="view-content">
        <div className="settings-container">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="settings-section">
                <div className="section-header">
                  <Icon size={20} />
                  <h2>{section.title}</h2>
                </div>
                <div className="section-content">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="setting-item">
                      <div className="setting-label">
                        <label>{item.label}</label>
                      </div>
                      <div className="setting-control">
                        {item.type === 'toggle' && (
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={item.value}
                              onChange={() => {}}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        )}
                        {item.type === 'path' && (
                          <div className="path-input">
                            <input
                              type="text"
                              value={item.value}
                              readOnly
                            />
                            <button className="btn-browse">Browse</button>
                          </div>
                        )}
                        {item.type === 'select' && (
                          <select value={item.value}>
                            {item.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {item.type === 'readonly' && (
                          <span className="readonly-value">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .view-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #e0e0e0;
        }

        .view-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .view-title h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .view-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .settings-container {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-section {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }

        .section-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .section-content {
          padding: 8px 0;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-label label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .setting-control {
          display: flex;
          align-items: center;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #ff5f57;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .path-input {
          display: flex;
          gap: 8px;
          width: 400px;
        }

        .path-input input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 13px;
          background: #f5f5f5;
        }

        .btn-browse {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-browse:hover {
          background: #f5f5f5;
          border-color: #ff5f57;
        }

        select {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          min-width: 150px;
        }

        .readonly-value {
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
