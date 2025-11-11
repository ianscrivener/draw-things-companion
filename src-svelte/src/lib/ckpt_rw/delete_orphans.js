/**
 * delete_orphans - Delete ckpts from Mac or Stash Orphans
 *
 * @param {string} location - Location (mac|stash)
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 9 - File delete error
 * 4 - Insufficient permissions
 * 43 - Only copy exists (cannot delete)
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Bulk delete all orphaned checkpoint files from specified location.
 * - Query in-memory object for ckpts where location=location AND is_orphan=true
 * - Delete files using @tauri-apps/plugin-fs
 * - Update in-memory object to remove deleted checkpoint entries
 * - Return summary: count deleted, space freed, any failures
 */
import { appState } from '../../appState.svelte.js';
import { delete_ckpt } from './delete_ckpt.js';
import { get_parents } from '../data/get_parents.js';

export async function delete_orphans(location) {
  console.log(`[delete_orphans] Starting - location: ${location}`);

  try {
    const summary = {
      attempted: 0,
      deleted: 0,
      spaceFree: 0,
      errors: []
    };

    // Find all orphans at specified location
    const orphans = [];

    for (const type of ['models', 'loras', 'controls']) {
      for (const ckpt of appState[location][type]) {
        // Check if orphan (no parents)
        const parentsResult = await get_parents(ckpt.filename);
        if (parentsResult.code === 0 && parentsResult.result.length === 0) {
          orphans.push({ filename: ckpt.filename, type, size: ckpt.file_size || 0 });
        }
      }
    }

    console.log(`[delete_orphans] Found ${orphans.length} orphans`);

    // Delete each orphan
    for (const orphan of orphans) {
      summary.attempted++;

      try {
        const deleteResult = await delete_ckpt(location, orphan.filename);

        if (deleteResult.code === 0) {
          summary.deleted++;
          summary.spaceFree += orphan.size;
          console.log(`[delete_orphans] Deleted: ${orphan.filename}`);
        } else {
          summary.errors.push({ file: orphan.filename, error: deleteResult.error });
          console.warn(`[delete_orphans] Failed to delete ${orphan.filename}:`, deleteResult.error);
        }
      } catch (error) {
        summary.errors.push({ file: orphan.filename, error: error.message });
        console.error(`[delete_orphans] Error deleting ${orphan.filename}:`, error);
      }
    }

    console.log(`[delete_orphans] Completed - deleted ${summary.deleted}/${summary.attempted} files`);

    return {
      code: summary.errors.length > 0 ? 1 : 0,
      result: summary,
      error: summary.errors.length > 0 ? summary.errors : []
    };

  } catch (error) {
    console.error('[delete_orphans] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
