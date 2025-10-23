'use client';

import { useState, useEffect } from 'react';
import { Settings, Folder } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export default function SettingsView() {
  const [paths, setPaths] = useState({
    drawThingsPath: '',
    stashPath: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPaths();
  }, []);

  async function loadPaths() {
    try {
      const appPaths = await invoke('get_app_paths');
      setPaths({
        drawThingsPath: appPaths.dt_base_dir,
        stashPath: appPaths.stash_dir || ''
      });
    } catch (error) {
      console.error('Failed to load paths:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBrowseStash() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Stash Directory'
      });

      if (selected) {
        setIsSaving(true);
        await invoke('update_stash_dir', { newStashDir: selected });
        setPaths(prev => ({ ...prev, stashPath: selected }));
      }
    } catch (error) {
      console.error('Failed to update stash directory:', error);
      alert('Failed to update stash directory: ' + error);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="view-container">
        <div className="view-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      id: 'paths',
      title: 'Paths & Locations',
      icon: Folder,
      items: [
        {
          label: 'DrawThings Directory',
          value: paths.drawThingsPath,
          type: 'readonly',
          description: 'Location of DrawThings app data (read-only)'
        },
        {
          label: 'Stash Directory',
          value: paths.stashPath,
          type: 'path',
          description: 'External directory for offloading models (configured in .env)',
          onBrowse: handleBrowseStash,
          disabled: true
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
                        {item.description && (
                          <span className="setting-description">{item.description}</span>
                        )}
                      </div>
                      <div className="setting-control">
                        {item.type === 'readonly' && (
                          <span className="readonly-value">{item.value}</span>
                        )}
                        {item.type === 'path' && (
                          <div className="path-input">
                            <input
                              type="text"
                              value={item.value}
                              readOnly
                              placeholder="Not set"
                            />
                            <button 
                              className="btn-browse"
                              onClick={item.onBrowse}
                              disabled={item.disabled || isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Browse'}
                            </button>
                          </div>
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

        .setting-description {
          display: block;
          font-size: 12px;
          color: #666;
          margin-top: 4px;
          font-weight: 400;
        }

        .setting-control {
          display: flex;
          align-items: center;
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
          min-width: 80px;
        }

        .btn-browse:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #ff5f57;
        }

        .btn-browse:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .readonly-value {
          font-size: 14px;
          color: #666;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
