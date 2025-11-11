/**
 * copy_ckpt - Copy ckpt from Mac to Stash, or Stash to Mac
 *
 * @param {string} ckpt_filename - The checkpoint filename
 * @param {string} source - Source location (mac|stash)
 * @param {string} destination - Destination location (mac|stash)
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * @notes After 'Mac to Stash' run `prune_mac`
 *
 * ERROR CODES:
 * 3 - Insufficient disk space
 * 4 - Insufficient permissions
 * 5 - File not found
 * 6 - File already exists at destination
 * 10 - File copy error
 * 46 - Source and destination same
 * 47 - Source file missing
 * 48 - Destination path invalid
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Copies a single checkpoint file,  MacHD>Stash or Stash>MacHD.
 * - Use @tauri-apps/plugin-fs for file operations (readFile, writeFile)
 * - Resolve source/destination paths from settings (DT_BASE_DIR/STASH_DIR + /Models/)
 * - Handle large files efficiently (models can be several GB)
 * - Return detailed error info if copy fails (disk space, permissions, etc.)
 */
import { readFile, writeFile, exists } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';

export async function copy_ckpt(ckpt_filename, source, destination) {
  console.log(`[copy_ckpt] Starting - ${ckpt_filename} from ${source} to ${destination}`);

  try {
    // Validate source and destination are different
    if (source === destination) {
      console.error('[copy_ckpt] Source and destination are the same');
      return {
        code: 1,
        result: false,
        error: [{ code: 46, message: 'Source and destination same' }]
      };
    }

    // Get source and destination paths
    const sourceDir = source === 'mac' ? appState.settings.DT_BASE_DIR : appState.settings.STASH_DIR;
    const destDir = destination === 'mac' ? appState.settings.DT_BASE_DIR : appState.settings.STASH_DIR;

    if (!sourceDir || !destDir) {
      const errorCode = !sourceDir ? 18 : 19;
      const errorMsg = !sourceDir ? 'DT_BASE_DIR not configured' : 'STASH_DIR not configured';
      console.error('[copy_ckpt]', errorMsg);
      return {
        code: 1,
        result: false,
        error: [{ code: errorCode, message: errorMsg }]
      };
    }

    const sourcePath = `${sourceDir}/Models/${ckpt_filename}`;
    const destPath = `${destDir}/Models/${ckpt_filename}`;

    // Check if source file exists
    try {
      const sourceExists = await exists(sourcePath);
      if (!sourceExists) {
        console.error('[copy_ckpt] Source file not found:', sourcePath);
        return {
          code: 1,
          result: false,
          error: [{ code: 47, message: 'Source file missing', details: sourcePath }]
        };
      }
    } catch (error) {
      console.error('[copy_ckpt] Error checking source file:', error);
      return {
        code: 1,
        result: false,
        error: [{ code: 5, message: 'File not found', details: error.message }]
      };
    }

    // Check if destination file already exists
    try {
      const destExists = await exists(destPath);
      if (destExists) {
        console.warn('[copy_ckpt] Destination file already exists:', destPath);
        return {
          code: 1,
          result: false,
          error: [{ code: 6, message: 'File already exists at destination', details: destPath }]
        };
      }
    } catch (error) {
      console.error('[copy_ckpt] Error checking destination:', error);
    }

    // Copy the file
    try {
      console.log(`[copy_ckpt] Reading from: ${sourcePath}`);
      const fileContent = await readFile(sourcePath);

      console.log(`[copy_ckpt] Writing to: ${destPath}`);
      await writeFile(destPath, fileContent);

      console.log('[copy_ckpt] File copied successfully');
      return {
        code: 0,
        result: true,
        error: []
      };

    } catch (copyError) {
      console.error('[copy_ckpt] File copy error:', copyError);

      // Determine specific error type
      if (copyError.message && copyError.message.includes('No space')) {
        return {
          code: 1,
          result: false,
          error: [{ code: 3, message: 'Insufficient disk space', details: copyError.message }]
        };
      }
      if (copyError.message && copyError.message.includes('Permission denied')) {
        return {
          code: 1,
          result: false,
          error: [{ code: 4, message: 'Insufficient permissions', details: copyError.message }]
        };
      }

      return {
        code: 1,
        result: false,
        error: [{ code: 10, message: 'File copy error', details: copyError.message }]
      };
    }

  } catch (error) {
    console.error('[copy_ckpt] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
