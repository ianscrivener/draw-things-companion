'use client';

import { useState, useEffect } from 'react';
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import { Save, X, HardDrive, Archive, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

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
  onReload,
  hasUnsavedChanges = false,
  loading = false,
  saving = false,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [deleteFiles, setDeleteFiles] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Handle delete confirmation
  const handleDeleteClick = (model) => {
    setModelToDelete(model);
    setDeleteFiles(false);
    setShowDeleteConfirm(true);
  };

  // Handle delete model
  const handleDeleteModel = async () => {
    if (!modelToDelete) return;

    try {
      setDeleting(true);
      await invoke('delete_model', {
        modelId: modelToDelete.model.id,
        deleteFiles: deleteFiles,
      });

      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setModelToDelete(null);
      setDeleteFiles(false);

      // Reload models if there's a reload function
      if (onReload) {
        await onReload();
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      alert(`Failed to delete model: ${error}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-3 border-b border-gray-250 bg-white">
        <h1 className="m-0 text-2xl font-bold">{title}</h1>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-3 py-1 border border-gray-250 rounded-md text-md font-semibold cursor-pointer transition-all bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={!hasUnsavedChanges || loading || saving}
          >
            <X size={18} />
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 border-none rounded-md text-md font-semibold cursor-pointer transition-all bg-brand text-white hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSave}
            disabled={!hasUnsavedChanges || loading || saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Two Panes */}
      <div className="grid grid-cols-2 gap-0 flex-1 overflow-hidden">
        {/* Left Pane - Mac HD */}
        <div className="flex flex-col h-full overflow-hidden border-r-2 border-gray-250">
          <div className="flex items-center gap-3 px-6 py-1.5 bg-gray-100 border-b border-gray-250">
            <HardDrive size={16} />
            <h2 className="m-0 text-xl font-bold flex-1">Macintosh HD</h2>
            <span className="bg-gray-250 px-2.5 py-0.5 rounded-xl text-base font-semibold text-gray-700">
              {macModels.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4" ref={macListRef}>
            {macModels.length === 0 ? (
              <div className="text-center py-15 px-5 text-gray-500">
                <p className="my-2">No models on Mac HD</p>
                <p className="text-base text-gray-450 my-2">Drag models from Stash to add them</p>
              </div>
            ) : (
              macModels.map((item, index) => (
                <div
                  key={item.model.id}
                  className={`flex items-center gap-3 px-4 py-2 bg-white border border-gray-250 rounded-md mb-2 transition-all hover:border-brand hover:shadow-elevation-sm ${saving ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
                  onDoubleClick={() => handleModelClick(item)}
                  data-drag-disabled={saving}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-gray-150 rounded-sm text-base font-bold text-gray-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-md font-semibold mb-1 break-words">
                      {item.custom_name || item.model.display_name || item.model.filename}
                    </div>
                    <div className="text-sm text-gray-700 flex gap-3">
                      {formatFileSize(item.model.file_size)}
                      {item.lora_strength && (
                        <span className="text-brand font-semibold">
                          Strength: {item.lora_strength}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="bg-transparent border border-gray-250 rounded-sm p-1.5 cursor-pointer transition-all text-gray-700 hover:bg-error-light hover:border-error-dark hover:text-error-dark disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-250 disabled:hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromMac(item.model.id);
                    }}
                    disabled={saving}
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
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-1.5 bg-gray-100 border-b border-gray-250">
            <Archive size={16} />
            <h2 className="m-0 text-xl font-bold flex-1">Stash</h2>
            <span className="bg-gray-250 px-2.5 py-0.5 rounded-xl text-base font-semibold text-gray-700">
              {stashModels.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {stashModels.length === 0 ? (
              <div className="text-center py-15 px-5 text-gray-500">
                <p className="my-2">No models in stash</p>
              </div>
            ) : (
              stashModels.map((item) => {
                const onMac = isOnMac(item.model.id);
                return (
                  <div
                    key={item.model.id}
                    className={`
                      flex items-center gap-3 px-4 py-2 bg-white border border-gray-250 rounded-md mb-2 transition-all
                      hover:border-brand hover:shadow-elevation-sm
                      ${onMac ? 'opacity-50 bg-gray-50 hover:opacity-60' : ''}
                      ${saving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                    `}
                    onDoubleClick={() => handleModelClick(item)}
                    onClick={() => {
                      if (!onMac && !saving) {
                        onAddToMac(item.model.id);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <div className="text-md font-semibold mb-1 break-words">
                        {item.model.display_name || item.model.filename}
                      </div>
                      <div className="text-sm text-gray-700">
                        {formatFileSize(item.model.file_size)}
                      </div>
                    </div>
                    {onMac && (
                      <div className="px-2.5 py-1 bg-info-light text-info-dark rounded-sm text-sm font-semibold">
                        On Mac
                      </div>
                    )}
                    <button
                      className="bg-transparent border border-gray-250 rounded-sm p-1.5 cursor-pointer transition-all text-gray-700 hover:bg-error-light hover:border-error-dark hover:text-error-dark disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-250 disabled:hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item);
                      }}
                      disabled={saving || deleting}
                      title="Delete model"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Model Details Modal */}
      {showModal && selectedModel && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-xl w-[90%] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="m-0 text-2xl font-bold">Model Details</h3>
              <button
                className="bg-transparent border-none cursor-pointer p-1 text-gray-700 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-bold text-gray-700">Filename:</span>
                <span className="text-gray-800 break-all">{selectedModel.model.filename}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-bold text-gray-700">Type:</span>
                <span className="text-gray-800 break-all">{selectedModel.model.model_type}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-bold text-gray-700">Size:</span>
                <span className="text-gray-800 break-all">{formatFileSize(selectedModel.model.file_size)}</span>
              </div>
              {selectedModel.model.checksum && (
                <div className="grid grid-cols-[120px_1fr] gap-4">
                  <span className="font-bold text-gray-700">Checksum:</span>
                  <span className="text-gray-800 break-all font-mono text-xs">{selectedModel.model.checksum}</span>
                </div>
              )}
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-bold text-gray-700">On Mac HD:</span>
                <span className="text-gray-800 break-all">{selectedModel.is_on_mac ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && modelToDelete && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-modal"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-error-light rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-error-dark" />
              </div>
              <h3 className="m-0 text-2xl font-bold text-gray-900">Delete Model?</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{modelToDelete.model.filename}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                This will remove the model from the database{modelToDelete.is_on_mac ? ' and from Mac HD' : ''}.
              </p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteFiles}
                  onChange={(e) => setDeleteFiles(e.target.checked)}
                  disabled={deleting}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Also delete file(s) from disk
                </span>
              </label>
              {deleteFiles && (
                <p className="text-xs text-error-dark mt-2 ml-6">
                  ⚠️ This action cannot be undone!
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2.5 border border-gray-250 rounded-md text-md font-semibold cursor-pointer transition-all bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 border-none rounded-md text-md font-semibold cursor-pointer transition-all bg-error text-white hover:bg-error-dark disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteModel}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
