'use client';

import { useState, useEffect, useCallback } from 'react';
import * as TauriHandler from '../lib/tauri_handler';

/**
 * Custom hook for managing models with Mac HD and Stash panes
 * @param {string} modelType - Type of model: 'model', 'lora', or 'controlnet'
 */
export function useModels(modelType) {
  const [models, setModels] = useState([]);
  const [macModels, setMacModels] = useState([]);
  const [stashModels, setStashModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load models from backend
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allModels = await TauriHandler.get_models(modelType);
      console.log(`[useModels] Loaded ${allModels.length} ${modelType} models:`, allModels);

      // Separate into Mac and Stash lists
      // Database structure: exists_mac_hd, mac_display_order, filename
      const mac = allModels
        .filter(m => m.exists_mac_hd)
        .sort((a, b) => (a.mac_display_order || 0) - (b.mac_display_order || 0));

      const stash = allModels
        .filter(m => !m.exists_mac_hd)
        .sort((a, b) => {
          // Sort by display_name (custom) > display_name_original > filename
          const aName = a.display_name || a.display_name_original || a.filename || '';
          const bName = b.display_name || b.display_name_original || b.filename || '';
          return aName.localeCompare(bName);
        });

      console.log(`[useModels] Mac: ${mac.length}, Stash: ${stash.length}`);

      setModels(allModels);
      setMacModels(mac);
      setStashModels(stash);
    } catch (err) {
      setError(err.message || 'Failed to load models');
      console.error('[useModels] Error loading models:', err);
    } finally {
      setLoading(false);
    }
  }, [modelType]);

  // Load on mount and when modelType changes
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Add model to Mac HD pane
  const addToMac = useCallback((modelId) => {
    const model = stashModels.find(m => m.filename === modelId);
    if (!model) return;

    const newOrder = macModels.length;
    const updatedModel = { ...model, mac_display_order: newOrder, exists_mac_hd: true };

    setMacModels(prev => [...prev, updatedModel]);
    setStashModels(prev => prev.map(m =>
      m.filename === modelId ? updatedModel : m
    ));

    // Deduplicate: remove any previous actions for this model, then add new action
    setPendingChanges(prev => {
      const filtered = prev.filter(c => c.modelId !== modelId);
      return [...filtered, { action: 'add', modelId, order: newOrder }];
    });
    setHasUnsavedChanges(true);
  }, [macModels, stashModels]);

  // Remove model from Mac HD pane
  const removeFromMac = useCallback((modelId) => {
    const model = macModels.find(m => m.filename === modelId);
    if (!model) return;

    const updatedModel = { ...model, mac_display_order: null, exists_mac_hd: false };

    setMacModels(prev => prev.filter(m => m.filename !== modelId));
    setStashModels(prev => prev.map(m =>
      m.filename === modelId ? updatedModel : m
    ));

    // Deduplicate: remove any previous actions for this model, then add new action
    setPendingChanges(prev => {
      const filtered = prev.filter(c => c.modelId !== modelId);
      return [...filtered, { action: 'remove', modelId }];
    });
    setHasUnsavedChanges(true);
  }, [macModels]);

  // Reorder models in Mac HD pane
  const reorderMac = useCallback((newOrder) => {
    const updatedModels = newOrder.map((model, index) => ({
      ...model,
      mac_display_order: index,
    }));

    setMacModels(updatedModels);

    // Don't add reorder to pendingChanges - we use macModels snapshot during save
    // This prevents accumulating hundreds of redundant reorder operations
    setHasUnsavedChanges(true);
  }, []);

  // Save all pending changes
  const saveChanges = useCallback(async () => {
    // Prevent concurrent saves
    if (saving) {
      return { success: false, error: 'Save already in progress' };
    }

    // Capture snapshots to prevent race conditions
    const changesToSave = [...pendingChanges];
    const macModelsSnapshot = [...macModels];

    try {
      setSaving(true);
      setError(null);

      // Process all pending changes from snapshot
      for (const change of changesToSave) {
        if (change.action === 'add') {
          await TauriHandler.add_model_to_mac(change.modelId, change.order);
        } else if (change.action === 'remove') {
          await TauriHandler.remove_model_from_mac(change.modelId);
        }
      }

      // Update order for all mac models from snapshot
      const orderUpdates = macModelsSnapshot.map(m => [m.filename, m.mac_display_order]);
      if (orderUpdates.length > 0) {
        await TauriHandler.update_models_order(orderUpdates);
      }

      // Reload to get fresh data
      await loadModels();

      setPendingChanges([]);
      setHasUnsavedChanges(false);

      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      console.error('Error saving changes:', err);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [saving, pendingChanges, macModels, loadModels]);

  // Cancel pending changes
  const cancelChanges = useCallback(() => {
    loadModels();
    setPendingChanges([]);
    setHasUnsavedChanges(false);
  }, [loadModels]);

  return {
    models,
    macModels,
    stashModels,
    loading,
    saving,
    error,
    hasUnsavedChanges,
    addToMac,
    removeFromMac,
    reorderMac,
    saveChanges,
    cancelChanges,
    reload: loadModels,
  };
}
