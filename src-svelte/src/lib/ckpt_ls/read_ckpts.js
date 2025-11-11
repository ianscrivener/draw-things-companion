/**
 * read_ckpts - Lists ckpts on the filesystem
 *
 * @param {string} location - Location (mac|stash)
 * @param {string} type - Model type (model|lora|control)
 * @returns {Object} { code: 0|1, result: [array of objects with ckpt_filename, file_size, file_date], error: [] }
 *
 * ERROR CODES:
 * 11 - Directory not found
 * 14 - Directory not readable
 * 4 - Insufficient permissions
 * 18 - DT_BASE_DIR not configured
 * 19 - STASH_DIR not configured
 * 22 - DT_BASE_DIR not accessible
 * 23 - STASH_DIR not accessible
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Scans filesystem to discover checkpoint files at specified location.
 * - Use @tauri-apps/plugin-fs readDir() to list files in Models directory
 * - Filter for .ckpt extensions only
 * - Get file metadata (size, modified date) using stat()
 * - DO NOT try to determine type from filename - type parameter is for filtering only
 * - Return array of file info objects for in-memory object comparison/updates
 */
import { readDir, stat } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';

export async function read_ckpts(location, type) {
  console.log(`[read_ckpts] Starting - location: ${location}, type: ${type}`);

  try {
    // Determine base directory based on location
    const baseDir = location === 'mac'
      ? appState.settings.DT_BASE_DIR
      : appState.settings.STASH_DIR;

    if (!baseDir) {
      const errorCode = location === 'mac' ? 18 : 19;
      const errorMsg = location === 'mac' ? 'DT_BASE_DIR not configured' : 'STASH_DIR not configured';
      console.error('[read_ckpts]', errorMsg);
      return {
        code: 1,
        result: null,
        error: [{ code: errorCode, message: errorMsg }]
      };
    }

    // Construct path to Models directory
    const modelsDir = `${baseDir}/Models`;
    console.log('[read_ckpts] Scanning directory:', modelsDir);

    try {
      // Read directory contents
      const entries = await readDir(modelsDir);

      // Filter for .ckpt files only
      const ckptFiles = entries.filter(entry =>
        entry.isFile && entry.name.endsWith('.ckpt')
      );

      console.log(`[read_ckpts] Found ${ckptFiles.length} .ckpt files`);

      // Get metadata for each file
      const ckptData = await Promise.all(
        ckptFiles.map(async (entry) => {
          try {
            const filePath = `${modelsDir}/${entry.name}`;
            const fileStats = await stat(filePath);

            return {
              ckpt_filename: entry.name,
              file_size: fileStats.size,
              file_date: fileStats.mtime ? new Date(fileStats.mtime * 1000).toISOString() : null
            };
          } catch (statError) {
            console.warn(`[read_ckpts] Could not stat file ${entry.name}:`, statError);
            return {
              ckpt_filename: entry.name,
              file_size: null,
              file_date: null
            };
          }
        })
      );

      console.log(`[read_ckpts] Successfully read ${ckptData.length} checkpoint files`);
      return {
        code: 0,
        result: ckptData,
        error: []
      };

    } catch (dirError) {
      console.error('[read_ckpts] Directory read error:', dirError);

      // Determine specific error type
      if (dirError.message && dirError.message.includes('No such file')) {
        return {
          code: 1,
          result: null,
          error: [{ code: 11, message: 'Directory not found', details: modelsDir }]
        };
      }
      if (dirError.message && dirError.message.includes('Permission denied')) {
        return {
          code: 1,
          result: null,
          error: [{ code: 4, message: 'Insufficient permissions', details: modelsDir }]
        };
      }

      return {
        code: 1,
        result: null,
        error: [{ code: 14, message: 'Directory not readable', details: dirError.message }]
      };
    }

  } catch (error) {
    console.error('[read_ckpts] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
