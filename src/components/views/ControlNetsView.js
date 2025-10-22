'use client';

import { useState } from 'react';
import { Factory, Search, Filter, Download, Archive } from 'lucide-react';

export default function ControlNetsView() {
  const [controlnets, setControlnets] = useState([
    {
      id: 1,
      name: 'Canny Edge Detection',
      type: 'canny',
      size: '1.45 GB',
      location: 'local',
      compatible: 'SDXL, SD1.5'
    },
    {
      id: 2,
      name: 'Depth Map',
      type: 'depth',
      size: '1.45 GB',
      location: 'local',
      compatible: 'SDXL'
    },
    {
      id: 3,
      name: 'OpenPose',
      type: 'pose',
      size: '1.45 GB',
      location: 'stash',
      compatible: 'SD1.5'
    }
  ]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <Factory size={28} />
          <h1>ControlNets</h1>
          <span className="count">{controlnets.length}</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search ControlNets..." />
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
        <div className="controlnets-grid">
          {controlnets.map((cn) => (
            <div key={cn.id} className="cn-card">
              <div className="cn-preview">
                <Factory size={48} />
                <span className="cn-type">{cn.type}</span>
              </div>
              <div className="cn-info">
                <h3>{cn.name}</h3>
                <p className="cn-compatible">{cn.compatible}</p>
                <div className="cn-meta">
                  <span>{cn.size}</span>
                  <span className={`location ${cn.location}`}>{cn.location}</span>
                </div>
              </div>
              <div className="cn-actions">
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

        .controlnets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .cn-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .cn-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #ff5f57;
        }

        .cn-preview {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 16px;
          position: relative;
        }

        .cn-type {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.9);
          color: #764ba2;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .cn-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .cn-compatible {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #666;
        }

        .cn-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #666;
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

        .cn-actions {
          margin-top: 16px;
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
          flex: 1;
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
