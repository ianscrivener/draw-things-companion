'use client';

import { X } from 'lucide-react';

export default function LogModal({ logs, onClose }) {
  const getLogColor = (level) => {
    switch (level) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#4ade80';
      case 'info':
      default: return '#888';
    }
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'error': return '✖';
      case 'warning': return '⚠';
      case 'success': return '✓';
      case 'info':
      default: return '•';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Activity Logs</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="logs-container">
            {logs.length === 0 ? (
              <div className="no-logs">No activity yet</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-timestamp">{log.timestamp}</span>
                  <span 
                    className="log-icon" 
                    style={{ color: getLogColor(log.level) }}
                  >
                    {getLogIcon(log.level)}
                  </span>
                  <span 
                    className="log-message"
                    style={{ color: getLogColor(log.level) }}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="log-count">{logs.length} log entries</div>
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1e1e1e;
          border: 1px solid #3a3a3a;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #3a3a3a;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #fff;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
        }

        .logs-container {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 13px;
        }

        .no-logs {
          color: #666;
          text-align: center;
          padding: 40px 20px;
        }

        .log-entry {
          display: flex;
          gap: 12px;
          padding: 3px 0;
          border-bottom: 1px solid #2a2a2a;
        }

        .log-entry:last-child {
          border-bottom: none;
        }

        .log-timestamp {
          color: #666;
          min-width: 65px;
          flex-shrink: 0;
        }

        .log-icon {
          min-width: 20px;
          flex-shrink: 0;
          font-weight: bold;
        }

        .log-message {
          flex: 1;
          word-break: break-word;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid #3a3a3a;
        }

        .log-count {
          font-size: 12px;
          color: #666;
        }

        .btn-close {
          padding: 8px 20px;
          background: #3a3a3a;
          border: 1px solid #4a4a4a;
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #4a4a4a;
          border-color: #5a5a5a;
        }

        /* Scrollbar styling */
        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #3a3a3a;
          border-radius: 4px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #4a4a4a;
        }
      `}</style>
    </div>
  );
}
