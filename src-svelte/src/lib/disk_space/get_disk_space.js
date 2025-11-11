/**
 * get_disk_space - Gets free disk space on Mac or Stash
 *
 * @param {string} location - Location (mac|stash)
 * @returns {Object} { code: 0|1, result: [bytes_free_space], error: [] }
 *
 * ERROR CODES:
 * 18 - DT_BASE_DIR not configured
 * 19 - STASH_DIR not configured
 * 20 - DT_BASE_DIR path invalid
 * 21 - STASH_DIR path invalid
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Retrieves available disk space for Mac HD or Stash drive.
 * - Use Bash command via Tauri: `df -k` then parse output
 * - For Mac: query path containing DT_BASE_DIR
 * - For Stash: query STASH_DIR (external drive)
 * - Return bytes free (convert from KB)
 */
import { Command } from '@tauri-apps/plugin-shell';
import { appState } from '../../appState.svelte.js';

export async function get_disk_space(location) {
  console.log(`[get_disk_space] Starting - location: ${location}`);

  try {
    // Get appropriate directory path
    const targetDir = location === 'mac' ? appState.settings.DT_BASE_DIR : appState.settings.STASH_DIR;

    if (!targetDir) {
      const errorCode = location === 'mac' ? 18 : 19;
      const errorMsg = location === 'mac' ? 'DT_BASE_DIR not configured' : 'STASH_DIR not configured';
      console.error('[get_disk_space]', errorMsg);
      return {
        code: 1,
        result: null,
        error: [{ code: errorCode, message: errorMsg }]
      };
    }

    try {
      // Use df command to get disk space (returns KB)
      const command = Command.create('df', ['-k', targetDir]);
      const output = await command.execute();

      if (output.code !== 0) {
        console.error('[get_disk_space] df command failed:', output.stderr);
        return {
          code: 1,
          result: null,
          error: [{ code: 100, message: 'Unknown error', details: output.stderr }]
        };
      }

      // Parse df output
      const lines = output.stdout.trim().split('\n');
      if (lines.length < 2) {
        console.error('[get_disk_space] Unexpected df output format');
        return {
          code: 1,
          result: null,
          error: [{ code: 100, message: 'Unknown error', details: 'Could not parse df output' }]
        };
      }

      // Parse the data line (skip header)
      const dataLine = lines[1].trim();
      const parts = dataLine.split(/\s+/);

      // Available space is typically the 4th column (index 3) in KB
      const availableKB = parseInt(parts[3], 10);

      if (isNaN(availableKB)) {
        console.error('[get_disk_space] Could not parse available space');
        return {
          code: 1,
          result: null,
          error: [{ code: 100, message: 'Unknown error', details: 'Invalid disk space value' }]
        };
      }

      // Convert KB to bytes
      const availableBytes = availableKB * 1024;

      console.log(`[get_disk_space] Available space: ${availableBytes} bytes`);

      return {
        code: 0,
        result: availableBytes,
        error: []
      };

    } catch (error) {
      console.error('[get_disk_space] Error executing df command:', error);
      return {
        code: 1,
        result: null,
        error: [{ code: 100, message: 'Unknown error', details: error.message }]
      };
    }

  } catch (error) {
    console.error('[get_disk_space] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
