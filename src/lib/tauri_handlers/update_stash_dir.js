import { invoke } from '@tauri-apps/api/core';

// ############################################################################
/**
 * update_stash_dir
 *
 * Updates the stash directory path in configuration.
 *
 * @param {string} newStashDir - New stash directory path
 * @returns {Promise<void>}
 */
export async function update_stash_dir(newStashDir) {
  try {
    return await invoke('update_stash_dir', { newStashDir });
  } catch (error) {
    console.error('[tauri_handler] update_stash_dir error:', error);
    throw error;
  }
}
