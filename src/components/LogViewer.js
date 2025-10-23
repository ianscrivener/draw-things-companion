'use client';

import { useState, useEffect } from 'react';
import { Clipboard } from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import LogModal from './LogModal';

export default function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    console.log('LogViewer mounted');
    let unlistenFn;
    let historicalLogCount = 0;

    // Fetch historical logs and set up listener
    const initialize = async () => {
      try {
        // Check if we're in Tauri environment
        if (typeof window !== 'undefined' && window.__TAURI__) {
          // First, fetch all historical logs
          const historicalLogs = await invoke('get_all_logs');
          console.log('Fetched historical logs:', historicalLogs.length);
          setLogs(historicalLogs);
          historicalLogCount = historicalLogs.length;

          // Then set up listener for new logs only
          unlistenFn = await listen('log-event', (event) => {
            const logEntry = event.payload;
            console.log('Received new log event:', logEntry);
            
            // Only add if it's truly a new log (after our historical fetch)
            setLogs(prev => {
              // Check if this log already exists (by timestamp and message)
              const exists = prev.some(log => 
                log.timestamp === logEntry.timestamp && 
                log.message === logEntry.message
              );
              
              if (exists) {
                console.log('Duplicate log, skipping:', logEntry.message);
                return prev;
              }
              
              return [...prev, logEntry];
            });
            
            // Trigger activity
            setIsActive(true);
            setFlashClass('active');
            
            // Stop activity after 2 seconds
            setTimeout(() => {
              setIsActive(false);
              setFlashClass('');
            }, 2000);
          });
          console.log('Event listener set up successfully');
        } else {
          console.warn('Not in Tauri environment, skipping log setup');
        }
      } catch (error) {
        console.error('Error initializing logs:', error);
      }
    };

    initialize();

    return () => {
      console.log('LogViewer unmounting');
      if (unlistenFn) {
        unlistenFn();
      }
    };
  }, []);

  const getLatestMessage = () => {
    if (logs.length === 0) return 'Ready';
    
    // Check if we have a completion message
    const lastLog = logs[logs.length - 1];
    if (lastLog.message.includes('All processing completed') || 
        lastLog.message.includes('Background initialization complete')) {
      return 'All processing completed';
    }
    
    // Show the latest log message (truncated)
    const msg = lastLog.message;
    return msg.length > 60 ? msg.substring(0, 57) + '...' : msg;
  };

  return (
    <>
      <div className="log-viewer" data-testid="log-viewer">
        <button 
          className={`clipboard-btn ${flashClass}`}
          onClick={() => setShowModal(true)}
          title="View full logs"
        >
          <Clipboard size={16} />
        </button>
        <div className="log-text">{getLatestMessage()}</div>
        <div className="log-count" style={{ marginLeft: 'auto', fontSize: '10px', color: '#666' }}>
          {logs.length} logs
        </div>
      </div>

      {showModal && (
        <LogModal 
          logs={logs} 
          onClose={() => setShowModal(false)} 
        />
      )}

      <style jsx>{`
        .log-viewer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: #2a2a2a;
          border-top: 1px solid #3a3a3a;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          height: 35px;
          box-sizing: border-box;
        }

        .clipboard-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
          flex-shrink: 0;
        }

        .clipboard-btn:hover {
          color: #fff;
        }

        .clipboard-btn.active {
          animation: flash 0.5s ease-in-out infinite;
        }

        @keyframes flash {
          0%, 100% { color: #888; }
          50% { color: #4ade80; }
        }

        .log-text {
          font-size: 11px;
          color: #ccc;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .log-count {
          margin-left: auto;
          font-size: 10px;
          color: #666;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}
