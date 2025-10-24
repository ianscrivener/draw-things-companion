'use client';

import { X } from 'lucide-react';
import theme from '@/styles/theme';

export default function LogModal({ logs, onClose }) {
  const getLogColorClass = (level) => {
    switch (level) {
      case 'error': return 'text-error';
      case 'warning': return 'text-warning';
      case 'success': return 'text-success';
      case 'info':
      default: return 'text-gray-600';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-modal"
      onClick={onClose}
    >
      <div
        className="bg-dark-800 border border-dark-200 rounded-lg w-[90%] max-w-3xl max-h-[80vh] flex flex-col shadow-elevation-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-2 border-b border-dark-200">
          <h2 className="m-0 text-xl font-bold text-white">Activity Logs</h2>
          <button
            className="bg-transparent border-none text-gray-600 cursor-pointer p-1 flex items-center transition-colors hover:text-white"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 scrollbar-thin scrollbar-track-dark-800 scrollbar-thumb-dark-200 hover:scrollbar-thumb-dark-100">
          <div className="font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-gray-700 text-center py-10 px-3">
                No activity yet
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-3 py-0.5 border-b border-dark-300 last:border-b-0"
                >
                  <span className="text-gray-700 min-w-[65px] flex-shrink-0">
                    {log.timestamp}
                  </span>
                  <span className={`min-w-[20px] flex-shrink-0 font-bold ${getLogColorClass(log.level)}`}>
                    {theme.getLogIcon(log.level)}
                  </span>
                  <span className={`flex-1 break-words ${getLogColorClass(log.level)}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-1 border-t border-dark-200">
          <div className="text-sm text-gray-700">
            {logs.length} log entries
          </div>
          <button
            className="px-2 py-1 bg-dark-200 border border-dark-100 rounded-md text-white text-md font-semibold cursor-pointer transition-all hover:bg-dark-100 hover:border-dark-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <style jsx global>{`
        /* Scrollbar styling for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-track-dark-800::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .scrollbar-thumb-dark-200::-webkit-scrollbar-thumb {
          background: #3a3a3a;
          border-radius: 4px;
        }
        .scrollbar-thumb-dark-200::-webkit-scrollbar-thumb:hover,
        .hover\\:scrollbar-thumb-dark-100::-webkit-scrollbar-thumb:hover {
          background: #4a4a4a;
        }
      `}</style>
    </div>
  );
}
