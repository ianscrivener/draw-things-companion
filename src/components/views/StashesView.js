'use client';

import { useState } from 'react';
import { BriefcaseBusiness, Plus, HardDrive, Folder } from 'lucide-react';

export default function StashesView() {
  const [stashes, setStashes] = useState([
    {
      id: 1,
      name: 'External SSD 1',
      path: '/Volumes/ExternalSSD1/DrawThings',
      type: 'external',
      status: 'connected',
      size: '2 TB',
      used: '1.2 TB'
    }
  ]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <BriefcaseBusiness size={28} />
          <h1>Stashes</h1>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Add Stash
        </button>
      </div>

      <div className="view-content">
        <div className="stash-grid">
          {stashes.map((stash) => (
            <div key={stash.id} className="stash-card">
              <div className="stash-icon">
                <HardDrive size={48} />
              </div>
              <div className="stash-info">
                <h3>{stash.name}</h3>
                <p className="stash-path">
                  <Folder size={14} />
                  {stash.path}
                </p>
                <div className="stash-stats">
                  <span className={`status ${stash.status}`}>{stash.status}</span>
                  <span>{stash.used} / {stash.size}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="stash-card add-stash">
            <Plus size={48} />
            <p>Add New Stash</p>
          </div>
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

        .stash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .stash-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 24px;
          transition: all 0.2s;
        }

        .stash-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #ff5f57;
        }

        .stash-card.add-stash {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
          min-height: 200px;
        }

        .stash-card.add-stash:hover {
          color: #ff5f57;
          border-color: #ff5f57;
        }

        .stash-icon {
          color: #666;
          margin-bottom: 16px;
        }

        .stash-info h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .stash-path {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
          margin: 0 0 16px 0;
        }

        .stash-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .status {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status.connected {
          background: #d4edda;
          color: #155724;
        }

        .status.disconnected {
          background: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
}
