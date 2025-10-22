'use client';

import { useState } from 'react';
import { ArchiveRestore, Search, Filter, Download, Tag } from 'lucide-react';

export default function EmbeddingsView() {
  const [embeddings, setEmbeddings] = useState([
    {
      id: 1,
      name: 'BadDream',
      type: 'negative',
      size: '24 KB',
      location: 'local',
      tags: ['quality', 'negative']
    },
    {
      id: 2,
      name: 'EasyNegative',
      type: 'negative',
      size: '16 KB',
      location: 'local',
      tags: ['negative', 'quality']
    },
    {
      id: 3,
      name: 'Vintage Photo',
      type: 'style',
      size: '32 KB',
      location: 'stash',
      tags: ['style', 'photography']
    }
  ]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <ArchiveRestore size={28} />
          <h1>Embeddings</h1>
          <span className="count">{embeddings.length}</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search embeddings..." />
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
        <div className="embeddings-list">
          {embeddings.map((embedding) => (
            <div key={embedding.id} className="embedding-card">
              <div className={`embedding-icon ${embedding.type}`}>
                <Tag size={24} />
              </div>
              <div className="embedding-info">
                <h3>{embedding.name}</h3>
                <div className="embedding-meta">
                  <span className={`type-badge ${embedding.type}`}>{embedding.type}</span>
                  <span>{embedding.size}</span>
                  <span className={`location ${embedding.location}`}>{embedding.location}</span>
                </div>
                <div className="tags">
                  {embedding.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
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

        .embeddings-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 900px;
        }

        .embedding-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          gap: 20px;
          transition: all 0.2s;
        }

        .embedding-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #ff5f57;
        }

        .embedding-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .embedding-icon.negative {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .embedding-icon.style {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .embedding-icon.concept {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .embedding-info {
          flex: 1;
        }

        .embedding-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .embedding-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
        }

        .type-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .type-badge.negative {
          background: #ffebee;
          color: #c62828;
        }

        .type-badge.style {
          background: #e3f2fd;
          color: #1565c0;
        }

        .type-badge.concept {
          background: #e8f5e9;
          color: #2e7d32;
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

        .tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tag {
          background: #f5f5f5;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
