'use client';

import { useState } from 'react';
import { SquarePen, Search, Filter, Download, Archive, Grid3x3, List } from 'lucide-react';

export default function LoRAsView() {
  const [viewMode, setViewMode] = useState('grid');
  const [loras, setLoras] = useState([
    {
      id: 1,
      name: 'Detail Tweaker XL',
      category: 'Enhancement',
      size: '144 MB',
      location: 'local',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Lighting Control',
      category: 'Style',
      size: '98 MB',
      location: 'local',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Face Fix v2',
      category: 'Enhancement',
      size: '156 MB',
      location: 'stash',
      rating: 4.2
    }
  ]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <SquarePen size={28} />
          <h1>LoRAs</h1>
          <span className="count">{loras.length}</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search LoRAs..." />
          </div>
          <button className="btn-secondary">
            <Filter size={18} />
            Filter
          </button>
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
          <button className="btn-primary">
            <Download size={18} />
            Import
          </button>
        </div>
      </div>

      <div className="view-content">
        <div className={`loras-${viewMode}`}>
          {loras.map((lora) => (
            <div key={lora.id} className="lora-card">
              <div className="lora-preview">
                <SquarePen size={36} />
              </div>
              <div className="lora-info">
                <h3>{lora.name}</h3>
                <div className="lora-meta">
                  <span className="badge">{lora.category}</span>
                  <span>{lora.size}</span>
                  <span className={`location ${lora.location}`}>{lora.location}</span>
                </div>
              </div>
              <div className="lora-actions">
                <button className="btn-icon" title="Archive">
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

        .view-toggle {
          display: flex;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }

        .view-toggle button {
          background: transparent;
          border: none;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle button:hover {
          background: #f5f5f5;
        }

        .view-toggle button.active {
          background: #ff5f57;
          color: white;
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

        .loras-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .loras-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lora-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .lora-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #ff5f57;
        }

        .lora-preview {
          width: 60px;
          height: 60px;
          background: #f5f5f5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }

        .lora-info {
          flex: 1;
        }

        .lora-info h3 {
          margin: 0 0 8px 0;
          font-size: 15px;
          font-weight: 600;
        }

        .lora-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }

        .badge {
          background: #fff3e0;
          color: #e65100;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .location {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .location.local {
          background: #d4edda;
          color: #155724;
        }

        .location.stash {
          background: #cce5ff;
          color: #004085;
        }

        .lora-actions {
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
