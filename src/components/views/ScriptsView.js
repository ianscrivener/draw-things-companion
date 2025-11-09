'use client';

import { useState } from 'react';
import { FileJson2, Search, Plus, Code, Play, Edit } from 'lucide-react';

export default function ScriptsView() {
  const [scripts, setScripts] = useState([
    {
      id: 1,
      name: 'Batch Resize Images',
      description: 'Resize all images in a folder to specified dimensions',
      language: 'bash',
      lastRun: '2 hours ago',
      status: 'ready'
    },
    {
      id: 2,
      name: 'Model Hash Calculator',
      description: 'Calculate SHA256 hashes for all model files',
      language: 'bash',
      lastRun: '1 day ago',
      status: 'ready'
    },
    {
      id: 3,
      name: 'Clean Temp Files',
      description: 'Remove temporary files and free up disk space',
      language: 'bash',
      lastRun: '3 days ago',
      status: 'ready'
    }
  ]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <FileJson2 size={28} />
          <h1>Scripts</h1>
          <span className="count">{scripts.length}</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search scripts..." />
          </div>
          <button className="btn-primary">
            <Plus size={18} />
            New Script
          </button>
        </div>
      </div>

      <div className="view-content">
        <div className="scripts-list">
          {scripts.map((script) => (
            <div key={script.id} className="script-card">
              <div className="script-icon">
                <Code size={32} />
              </div>
              <div className="script-info">
                <h3>{script.name}</h3>
                <p className="script-description">{script.description}</p>
                <div className="script-meta">
                  <span className="language-badge">{script.language}</span>
                  <span>Last run: {script.lastRun}</span>
                  <span className={`status ${script.status}`}>{script.status}</span>
                </div>
              </div>
              <div className="script-actions">
                <button className="btn-icon" title="Edit">
                  <Edit size={18} />
                </button>
                <button className="btn-run" title="Run Script">
                  <Play size={18} />
                  Run
                </button>
              </div>
            </div>
          ))}
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

        .count {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }

        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 200px;
          font-size: 14px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #ff5f57;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #ff4540;
        }

        .view-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .scripts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1000px;
        }

        .script-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 24px;
          display: flex;
          gap: 20px;
          transition: all 0.2s;
        }

        .script-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #ff5f57;
        }

        .script-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .script-info {
          flex: 1;
        }

        .script-info h3 {
          margin: 0 0 8px 0;
          font-size: 17px;
          font-weight: 600;
        }

        .script-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }

        .script-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #666;
        }

        .language-badge {
          background: #e3f2fd;
          color: #1565c0;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status.ready {
          background: #d4edda;
          color: #155724;
        }

        .status.running {
          background: #fff3cd;
          color: #856404;
        }

        .script-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-icon {
          background: transparent;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f5f5f5;
          border-color: #ff5f57;
          color: #ff5f57;
        }

        .btn-run {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-run:hover {
          background: #45a049;
        }
      `}</style>
    </div>
  );
}
