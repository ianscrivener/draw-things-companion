'use client';

import { useState, useEffect } from 'react';
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import { Save, X, HardDrive, Archive } from 'lucide-react';

export default function TwoPaneManager({ 
  modelType, 
  title,
  macModels = [],
  stashModels = [],
  onReorder,
  onAddToMac,
  onRemoveFromMac,
  onSave,
  onCancel,
  hasUnsavedChanges = false,
  loading = false,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Initialize drag and drop for Mac pane
  const [macListRef, macItems, setMacItems] = useDragAndDrop(
    macModels,
    {
      group: 'models',
      onSort: (newOrder) => {
        onReorder(newOrder);
      },
    }
  );

  // Update mac items when prop changes
  useEffect(() => {
    setMacItems(macModels);
  }, [macModels, setMacItems]);

  // Handle model click to show details
  const handleModelClick = (model) => {
    setSelectedModel(model);
    setShowModal(true);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Check if model is in Mac pane
  const isOnMac = (modelId) => {
    return macModels.some(m => m.model.id === modelId);
  };

  return (
    <div className="two-pane-container">
      {/* Header */}
      <div className="header">
        <h1 className="title">{title}</h1>
        <div className="header-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={!hasUnsavedChanges || loading}
          >
            <X size={18} />
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={onSave}
            disabled={!hasUnsavedChanges || loading}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Two Panes */}
      <div className="panes">
        {/* Left Pane - Mac HD */}
        <div className="pane pane-mac">
          <div className="pane-header">
            <HardDrive size={20} />
            <h2>Macintosh HD</h2>
            <span className="count">{macModels.length}</span>
          </div>
          <div className="pane-content" ref={macListRef}>
            {macModels.length === 0 ? (
              <div className="empty-state">
                <p>No models on Mac HD</p>
                <p className="hint">Drag models from Stash to add them</p>
              </div>
            ) : (
              macModels.map((item, index) => (
                <div
                  key={item.model.id}
                  className="model-item draggable"
                  onDoubleClick={() => handleModelClick(item)}
                  data-drag-disabled="false"
                >
                  <div className="model-order">{index + 1}</div>
                  <div className="model-info">
                    <div className="model-name">
                      {item.custom_name || item.model.display_name || item.model.filename}
                    </div>
                    <div className="model-meta">
                      {formatFileSize(item.model.file_size)}
                      {item.lora_strength && (
                        <span className="lora-strength">
                          Strength: {item.lora_strength}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromMac(item.model.id);
                    }}
                    title="Remove from Mac"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane - Stash */}
        <div className="pane pane-stash">
          <div className="pane-header">
            <Archive size={20} />
            <h2>Stash</h2>
            <span className="count">{stashModels.length}</span>
          </div>
          <div className="pane-content">
            {stashModels.length === 0 ? (
              <div className="empty-state">
                <p>No models in stash</p>
              </div>
            ) : (
              stashModels.map((item) => {
                const onMac = isOnMac(item.model.id);
                return (
                  <div
                    key={item.model.id}
                    className={`model-item ${onMac ? 'grayed' : ''}`}
                    onDoubleClick={() => handleModelClick(item)}
                    onClick={() => {
                      if (!onMac) {
                        onAddToMac(item.model.id);
                      }
                    }}
                  >
                    <div className="model-info">
                      <div className="model-name">
                        {item.model.display_name || item.model.filename}
                      </div>
                      <div className="model-meta">
                        {formatFileSize(item.model.file_size)}
                      </div>
                    </div>
                    {onMac && (
                      <div className="on-mac-badge">On Mac</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Model Details Modal */}
      {showModal && selectedModel && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Model Details</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Filename:</span>
                <span className="detail-value">{selectedModel.model.filename}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedModel.model.model_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Size:</span>
                <span className="detail-value">{formatFileSize(selectedModel.model.file_size)}</span>
              </div>
              {selectedModel.model.checksum && (
                <div className="detail-row">
                  <span className="detail-label">Checksum:</span>
                  <span className="detail-value checksum">{selectedModel.model.checksum}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">On Mac HD:</span>
                <span className="detail-value">{selectedModel.is_on_mac ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .two-pane-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #e0e0e0;
          background: white;
        }

        .title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-cancel, .btn-save {
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

        .btn-cancel {
          background: white;
          color: #666;
          border: 1px solid #e0e0e0;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .btn-cancel:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-save {
          background: #ff5f57;
          color: white;
        }

        .btn-save:hover:not(:disabled) {
          background: #ff4540;
        }

        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .panes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          flex: 1;
          overflow: hidden;
        }

        .pane {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .pane-mac {
          border-right: 2px solid #e0e0e0;
        }

        .pane-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }

        .pane-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          flex: 1;
        }

        .count {
          background: #e0e0e0;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          color: #666;
        }

        .pane-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .empty-state p {
          margin: 8px 0;
        }

        .hint {
          font-size: 13px;
          color: #bbb;
        }

        .model-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .model-item:hover {
          border-color: #ff5f57;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .model-item.draggable {
          cursor: grab;
        }

        .model-item.draggable:active {
          cursor: grabbing;
        }

        .model-item.grayed {
          opacity: 0.5;
          background: #f9f9f9;
        }

        .model-item.grayed:hover {
          opacity: 0.6;
        }

        .model-order {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #666;
        }

        .model-info {
          flex: 1;
        }

        .model-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .model-meta {
          font-size: 12px;
          color: #666;
          display: flex;
          gap: 12px;
        }

        .lora-strength {
          color: #ff5f57;
          font-weight: 500;
        }

        .on-mac-badge {
          padding: 4px 10px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .btn-remove {
          background: transparent;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
        }

        .btn-remove:hover {
          background: #fee;
          border-color: #f44336;
          color: #f44336;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .modal-header button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #666;
        }

        .modal-header button:hover {
          color: #333;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 16px;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
        }

        .detail-value {
          color: #333;
          word-break: break-all;
        }

        .detail-value.checksum {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
