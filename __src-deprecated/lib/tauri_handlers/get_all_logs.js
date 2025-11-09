// import { invoke } from '@tauri-apps/api/core';

// ############################################################################
/**
 * get_all_logs
 *
 * Retrieves all historical log entries from backend.
 *
 * @returns {Promise<Array>} Array of log entries:
 *   [{
 *     timestamp: string,  // ISO timestamp
 *     level: string,      // Log level (info, warn, error, debug)
 *     message: string     // Log message
 *   }]
 */
export async function get_all_logs() {
  try {
    // return await invoke('get_all_logs');
    return [];
  }
  catch (error) {
    console.error('[tauri_handler] get_all_logs error:', error);
    // Return empty array to prevent crashes
    return [];
  }
}
