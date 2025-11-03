'use client';

import { useState, useEffect } from 'react';
import { Clipboard } from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import * as TauriHandler from '../lib/tauri_handler';
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
          const historicalLogs = await TauriHandler.get_all_logs();
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
      <div
        className="flex items-center gap-3 px-2 py-1 bg-dark-300 border-t border-dark-200 fixed bottom-0 left-0 right-0 z-log-viewer h-log-viewer box-border"
        data-testid="log-viewer"
      >
        <button
          className={`
            bg-transparent border-none text-gray-600 cursor-pointer p-1 px-2
            flex items-center justify-center transition-colors duration-300 flex-shrink-0
            hover:text-white
            ${flashClass === 'active' ? 'animate-flash' : ''}
          `}
          onClick={() => setShowModal(true)}
          title="View full logs"
        >
          <Clipboard size={14} />
        </button>

        <div className="text-xs text-gray-400 font-mono whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {getLatestMessage()}
        </div>

        <div className="ml-auto text-xxs text-gray-400 px-2 flex-shrink-0">
          {logs.length} logs
        </div>
      </div>

      {showModal && (
        <LogModal
          logs={logs}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
