/**
 * delete_ckpt - Delete ckpt
 *
 * @param {string} location - Location (mac|stash)
 * @param {string} ckpt_filename - The checkpoint filename
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * @notes Extra confirmation step if the ckpt is not in Stash. Only deletes primary model/lora/control ckpt
 *
 * ERROR CODES:
 * 5 - File not found
 * 9 - File delete error
 * 4 - Insufficient permissions
 * 36 - Parent models exist (file in use)
 * 43 - Only copy exists (cannot delete)
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Permanently deletes a checkpoint file from specified location.
 * - Use @tauri-apps/plugin-fs remove() function
 * - Check if file exists in Stash before deleting from Mac (safety check)
 * - Check in-memory object to verify file isn't referenced by multiple models before deletion
 * - Return error if trying to delete a file that's the only copy
 * - Update in-memory object to remove the deleted checkpoint entry
 * - Consider adding user confirmation dialog in UI for Mac deletions
 */
import { remove, exists } from '@tauri-apps/plugin-fs';
import { appState, removeCkpt } from '../../appState.svelte.js';
import { get_parents } from '../data/get_parents.js';
import { is_stashed } from '../ckpt_ls/is_stashed.js';

export async function delete_ckpt(location, ckpt_filename) {
  console.log(`[delete_ckpt] Starting - ${location} ${ckpt_filename}`);

  try {
    // Safety check: verify file has parents (not in use)
    const parentsResult = await get_parents(ckpt_filename);
    if (parentsResult.code === 0 && parentsResult.result.length > 0) {
      console.error('[delete_ckpt] File has parent models - cannot delete');
      return {
        code: 1,
        result: false,
        error: [{ code: 36, message: 'Parent models exist (file in use)', details: `${parentsResult.result.length} parent(s) found` }]
      };
    }

    // Safety check for Mac: verify copy exists in Stash
    if (location === 'mac') {
      const stashCheck = await is_stashed(ckpt_filename);
      if (stashCheck.code !== 0 || !stashCheck.result) {
        console.error('[delete_ckpt] No copy in stash - cannot delete from Mac');
        return {
          code: 1,
          result: false,
          error: [{ code: 43, message: 'Only copy exists (cannot delete)', details: 'File not found in stash' }]
        };
      }
    }

    // Get base directory
    const baseDir = location === 'mac' ? appState.settings.DT_BASE_DIR : appState.settings.STASH_DIR;
    if (!baseDir) {
      const errorCode = location === 'mac' ? 18 : 19;
      const errorMsg = location === 'mac' ? 'DT_BASE_DIR not configured' : 'STASH_DIR not configured';
      console.error('[delete_ckpt]', errorMsg);
      return {
        code: 1,
        result: false,
        error: [{ code: errorCode, message: errorMsg }]
      };
    }

    const filePath = `${baseDir}/Models/${ckpt_filename}`;

    // Check if file exists
    try {
      const fileExists = await exists(filePath);
      if (!fileExists) {
        console.error('[delete_ckpt] File not found:', filePath);
        return {
          code: 1,
          result: false,
          error: [{ code: 5, message: 'File not found', details: filePath }]
        };
      }
    } catch (error) {
      console.error('[delete_ckpt] Error checking file:', error);
      return {
        code: 1,
        result: false,
        error: [{ code: 5, message: 'File not found', details: error.message }]
      };
    }

    // Delete the file
    try {
      await remove(filePath);
      console.log('[delete_ckpt] File deleted successfully');

      // Update in-memory object - remove from all types
      const types = ['model', 'lora', 'control'];
      for (const type of types) {
        removeCkpt(location, type, ckpt_filename);
      }

      return {
        code: 0,
        result: true,
        error: []
      };

    } catch (deleteError) {
      console.error('[delete_ckpt] Delete error:', deleteError);

      if (deleteError.message && deleteError.message.includes('Permission denied')) {
        return {
          code: 1,
          result: false,
          error: [{ code: 4, message: 'Insufficient permissions', details: deleteError.message }]
        };
      }

      return {
        code: 1,
        result: false,
        error: [{ code: 9, message: 'File delete error', details: deleteError.message }]
      };
    }

  } catch (error) {
    console.error('[delete_ckpt] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
