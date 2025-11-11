/**
 * prune_mac - Copy orphan ckpt from Mac to Stash and delete on Mac
 *
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * @notes Deleting Mac orphans requires checking that each ckpt is not being used by another model
 *
 * ERROR CODES:
 * 3 - Insufficient disk space
 * 6 - File already exists at destination
 * 10 - File copy error
 * 9 - File delete error
 * 36 - Parent models exist (file in use)
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Frees up Mac HD space by moving orphaned checkpoints to Stash.
 * - Query in-memory object for ckpts where location='mac' AND is_orphan=true
 * - For each orphan: copy to Stash, verify copy success, then delete from Mac
 * - Update in-memory object to set location='stash' for moved files
 * - Should check if file already exists in Stash before copying
 * - Return summary: files moved, space freed, any errors
 * - Consider batch processing with progress updates for large operations
 */
import { appState } from '../../appState.svelte.js';
import { copy_ckpt } from './copy_ckpt.js';
import { delete_ckpt } from './delete_ckpt.js';
import { get_parents } from '../data/get_parents.js';

export async function prune_mac() {
  console.log('[prune_mac] Starting');

  try {
    const summary = {
      attempted: 0,
      moved: 0,
      spaceFre: 0,
      errors: []
    };

    // Find all orphans on Mac
    const orphans = [];

    for (const type of ['models', 'loras', 'controls']) {
      for (const ckpt of appState.mac[type]) {
        // Check if orphan (not in DrawThings JSON)
        const parentsResult = await get_parents(ckpt.filename);
        if (parentsResult.code === 0 && parentsResult.result.length === 0) {
          orphans.push({ filename: ckpt.filename, type, size: ckpt.file_size || 0 });
        }
      }
    }

    console.log(`[prune_mac] Found ${orphans.length} orphans`);

    // Process each orphan
    for (const orphan of orphans) {
      summary.attempted++;

      try {
        // Copy to stash
        const copyResult = await copy_ckpt(orphan.filename, 'mac', 'stash');

        if (copyResult.code === 0) {
          // Successfully copied, now delete from Mac
          const deleteResult = await delete_ckpt('mac', orphan.filename);

          if (deleteResult.code === 0) {
            summary.moved++;
            summary.spaceFree += orphan.size;
            console.log(`[prune_mac] Moved: ${orphan.filename}`);
          } else {
            summary.errors.push({ file: orphan.filename, error: deleteResult.error });
            console.warn(`[prune_mac] Failed to delete ${orphan.filename}:`, deleteResult.error);
          }
        } else {
          summary.errors.push({ file: orphan.filename, error: copyResult.error });
          console.warn(`[prune_mac] Failed to copy ${orphan.filename}:`, copyResult.error);
        }
      } catch (error) {
        summary.errors.push({ file: orphan.filename, error: error.message });
        console.error(`[prune_mac] Error processing ${orphan.filename}:`, error);
      }
    }

    console.log(`[prune_mac] Completed - moved ${summary.moved}/${summary.attempted} files`);

    return {
      code: summary.errors.length > 0 ? 1 : 0,
      result: summary,
      error: summary.errors.length > 0 ? summary.errors : []
    };

  } catch (error) {
    console.error('[prune_mac] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
