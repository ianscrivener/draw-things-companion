import { invoke } from '@tauri-apps/api/core';

// ############################################################################
/**
 * delete_model
 *
 * Deletes model from database and optionally from disk.
 * If model is on Mac HD, it will be removed from there as well.
 *
 * @param {string} modelId - Model filename/ID
 * @param {boolean} deleteFiles - Whether to also delete files from disk
 * @returns {Promise<void>}
 */
export async function delete_model(modelId, deleteFiles) {
  try {
    return await invoke('delete_model', { modelId, deleteFiles });
  } catch (error) {
    console.error('[tauri_handler] delete_model error:', error);
    throw error;
  }
}
