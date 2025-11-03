import { invoke } from '@tauri-apps/api/core';

// ############################################################################
/**
 * remove_model_from_mac
 *
 * Removes a model from Mac HD (keeps it in stash).
 * Updates the database to mark model as not on Mac.
 *
 * @param {string} modelId - Model filename/ID
 * @returns {Promise<void>}
 */
export async function remove_model_from_mac(modelId) {
  try {
    return await invoke('remove_model_from_mac', { modelId });
  } catch (error) {
    console.error('[tauri_handler] remove_model_from_mac error:', error);
    throw error;
  }
}
