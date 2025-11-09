import { invoke } from '@tauri-apps/api/core';

// ############################################################################
/**
 * get_config_value
 *
 * Reads a configuration value from the backend config store.
 *
 * @param {string} key - Configuration key to retrieve
 * @returns {Promise<string|null>} Configuration value or null if not set
 */
export async function get_config_value(key) {
  try {
    return await invoke('get_config_value', { key });
  }
  catch (error) {
    console.error('[tauri_handler] get_config_value error:', error);
    // Return null to indicate value not found
    return null;
  }
}
