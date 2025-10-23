'use client';

import { Image } from 'lucide-react';

export default function ModelsView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <Image size={28} />
          <h1>Models</h1>
        </div>
      </div>

      <div className="view-content">
        {/* Blank page content */}
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
      `}</style>
    </div>
  );
}
