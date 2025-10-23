'use client';

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

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
      
      const allModels = await invoke('get_models', { modelType });
      
      // Separate into Mac and Stash lists
      const mac = allModels
        .filter(m => m.is_on_mac)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      
      const stash = allModels
        .sort((a, b) => a.model.filename.localeCompare(b.model.filename));
      
      setModels(allModels);
      setMacModels(mac);
      setStashModels(stash);
    } catch (err) {
      setError(err.message || 'Failed to load models');
      console.error('Error loading models:', err);
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
    const model = stashModels.find(m => m.model.id === modelId);
    if (!model) return;

    const newOrder = macModels.length;
    const updatedModel = { ...model, display_order: newOrder, is_on_mac: true };
    
    setMacModels(prev => [...prev, updatedModel]);
    setStashModels(prev => prev.map(m => 
      m.model.id === modelId ? updatedModel : m
    ));
    
    setPendingChanges(prev => [...prev, { action: 'add', modelId, order: newOrder }]);
    setHasUnsavedChanges(true);
  }, [macModels, stashModels]);

  // Remove model from Mac HD pane
  const removeFromMac = useCallback((modelId) => {
    const model = macModels.find(m => m.model.id === modelId);
    if (!model) return;

    const updatedModel = { ...model, display_order: null, is_on_mac: false };
    
    setMacModels(prev => prev.filter(m => m.model.id !== modelId));
    setStashModels(prev => prev.map(m => 
      m.model.id === modelId ? updatedModel : m
    ));
    
    setPendingChanges(prev => [...prev, { action: 'remove', modelId }]);
    setHasUnsavedChanges(true);
  }, [macModels]);

  // Reorder models in Mac HD pane
  const reorderMac = useCallback((newOrder) => {
    const updatedModels = newOrder.map((model, index) => ({
      ...model,
      display_order: index,
    }));
    
    setMacModels(updatedModels);
    
    const orderUpdates = updatedModels.map(m => ({
      action: 'reorder',
      modelId: m.model.id,
      order: m.display_order,
    }));
    
    setPendingChanges(prev => [...prev, ...orderUpdates]);
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
          await invoke('add_model_to_mac', {
            modelId: change.modelId,
            displayOrder: change.order,
          });
        } else if (change.action === 'remove') {
          await invoke('remove_model_from_mac', {
            modelId: change.modelId,
          });
        }
      }

      // Update order for all mac models from snapshot
      const orderUpdates = macModelsSnapshot.map(m => [m.model.id, m.display_order]);
      if (orderUpdates.length > 0) {
        await invoke('update_models_order', { updates: orderUpdates });
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
