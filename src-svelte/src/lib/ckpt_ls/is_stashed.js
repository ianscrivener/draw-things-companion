/**
 * is_stashed - Checks if a checkpoint is already in the stash
 *
 * @param {string} ckpt_filename - The checkpoint filename
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 19 - STASH_DIR not configured
 * 21 - STASH_DIR path invalid
 * 23 - STASH_DIR not accessible
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Quick check to see if a file exists in the Stash location.
 * - Use @tauri-apps/plugin-fs exists() to check file presence
 * - Construct full path: STASH_DIR/Models/ckpt_filename
 * - Can be used before copy/delete operations for safety checks
 * - Should be fast - just file existence check, no content verification
 */

// ###############################################################################
// ###############################################################################
import { exists } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';

// ###############################################################################
export async function is_stashed(ckpt_filename) {
  console.log(`[is_stashed] Checking: ${ckpt_filename}`);

  try {
    const stashDir = appState.settings.STASH_DIR;

    if (!stashDir) {
      console.error('[is_stashed] STASH_DIR not configured');
      return {
        code: 1,
        result: false,
        error: [{ code: 19, message: 'STASH_DIR not configured' }]
      };
    }

    // Construct full path to checkpoint in stash
    const ckptPath = `${stashDir}/Models/${ckpt_filename}`;

    try {
      const fileExists = await exists(ckptPath);
      console.log(`[is_stashed] File ${fileExists ? 'exists' : 'does not exist'} in stash`);

      return {
        code: 0,
        result: fileExists,
        error: []
      };

    } catch (error) {
      console.error('[is_stashed] Error checking file existence:', error);
      return {
        code: 1,
        result: false,
        error: [{ code: 23, message: 'STASH_DIR not accessible', details: error.message }]
      };
    }

  } catch (error) {
    console.error('[is_stashed] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
