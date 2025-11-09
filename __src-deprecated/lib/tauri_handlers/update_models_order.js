import { invoke } from '@tauri-apps/api/core';

// ############################################################################
/**
 * update_models_order
 *
 * Batch updates display order for all Mac models.
 * Used after drag-and-drop reordering.
 *
 * @param {Array<[string, number]>} updates - Array of [modelId, displayOrder] tuples
 * @returns {Promise<void>}
 */
export async function update_models_order(updates) {
  try {
    return await invoke('update_models_order', { updates });
  } catch (error) {
    console.error('[tauri_handler] update_models_order error:', error);
    throw error;
  }
}
