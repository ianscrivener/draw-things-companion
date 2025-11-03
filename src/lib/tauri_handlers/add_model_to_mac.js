import { invoke } from '@tauri-apps/api/core';

// ############################################################################
/**
 * add_model_to_mac
 *
 * Adds a model to Mac HD with specified display order.
 * Updates the database to mark model as being on Mac.
 *
 * @param {string} modelId - Model filename/ID
 * @param {number} displayOrder - Position in Mac HD list (0-based)
 * @returns {Promise<void>}
 */
export async function add_model_to_mac(modelId, displayOrder) {
  try {
    return await invoke('add_model_to_mac', { modelId, displayOrder });
  } catch (error) {
    console.error('[tauri_handler] add_model_to_mac error:', error);
    throw error;
  }
}
