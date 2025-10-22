'use client';

import { useState } from 'react';
import { Image, Search, Filter, Download, Archive } from 'lucide-react';

export default function ModelsView() {
  const [models, setModels] = useState([
    {
      id: 1,
      name: 'SDXL Base 1.0',
      type: 'SDXL',
      size: '6.94 GB',
      location: 'local',
      lastUsed: '2 hours ago'
    },
    {
      id: 2,
      name: 'Realistic Vision v5.1',
      type: 'SD1.5',
      size: '2.13 GB',
      location: 'local',
      lastUsed: '1 day ago'
    }
  ]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <Image size={28} />
          <h1>Models</h1>
          <span className="count">{models.length}</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search models..." />
          </div>
          <button className="btn-secondary">
            <Filter size={18} />
            Filter
          </button>
          <button className="btn-primary">
            <Download size={18} />
            Import
          </button>
        </div>
      </div>

      <div className="view-content">
        <div className="models-list">
          {models.map((model) => (
            <div key={model.id} className="model-card">
              <div className="model-preview">
                <Image size={48} />
              </div>
              <div className="model-info">
                <h3>{model.name}</h3>
                <div className="model-meta">
                  <span className="badge">{model.type}</span>
                  <span>{model.size}</span>
                  <span>•</span>
                  <span>{model.lastUsed}</span>
                </div>
              </div>
              <div className="model-actions">
                <button className="btn-icon" title="Archive to Stash">
                  <Archive size={18} />
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

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #ff5f57;
          color: white;
        }

        .btn-primary:hover {
          background: #ff4540;
        }

        .btn-secondary {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
        }

        .btn-secondary:hover {
          background: #f5f5f5;
        }

        .view-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .models-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .model-card {
          display: flex;
          align-items: center;
          gap: 20px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .model-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #ff5f57;
        }

        .model-preview {
          width: 80px;
          height: 80px;
          background: #f5f5f5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }

        .model-info {
          flex: 1;
        }

        .model-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .model-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }

        .badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .model-actions {
          display: flex;
          gap: 8px;
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
      `}</style>
    </div>
  );
}
