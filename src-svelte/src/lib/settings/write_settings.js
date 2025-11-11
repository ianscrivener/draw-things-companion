/**
 * write_settings - Writes application settings to the filesystem
 *
 * @param {Object} settings_object - The settings object to write
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 8 - File write error
 * 4 - Insufficient permissions
 * 11 - Directory not found
 * 12 - Directory creation failed
 * 41 - Invalid JSON structure
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Saves user configuration to TWO locations for redundancy.
 * - Write to primary: DTC_APP_DIR/settings.json
 * - Write to backup: STASH_DIR/App_Data/settings.json
 * - Use @tauri-apps/plugin-fs writeTextFile() with JSON.stringify()
 * - Pretty-print JSON (indent=2) for human readability
 * - If backup write fails, log warning but don't fail (backup is optional)
 * - Called when user changes settings in UI
 */

import { writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';

export async function write_settings(settings_object) {
  console.log('[write_settings] Starting');

  try {
    // Validate that we have a valid object
    if (!settings_object || typeof settings_object !== 'object') {
      console.error('[write_settings] Invalid settings object');
      return {
        code: 1,
        result: false,
        error: [{ code: 41, message: 'Invalid JSON structure', details: 'Settings must be an object' }]
      };
    }

    // Get DTC_APP_DIR from either the settings object or appState
    const dtcAppDir = settings_object.DTC_APP_DIR || appState.settings.DTC_APP_DIR;
    const stashDir = settings_object.STASH_DIR || appState.settings.STASH_DIR;

    if (!dtcAppDir) {
      console.error('[write_settings] DTC_APP_DIR not configured');
      return {
        code: 1,
        result: false,
        error: [{ code: 11, message: 'Directory not found', details: 'DTC_APP_DIR not configured' }]
      };
    }

    // Prepare JSON content (pretty-printed)
    const jsonContent = JSON.stringify(settings_object, null, 2);

    // Write to primary location: DTC_APP_DIR/settings.json
    const primaryPath = `${dtcAppDir}/settings.json`;

    try {
      // Ensure DTC_APP_DIR exists
      const dirExists = await exists(dtcAppDir);
      if (!dirExists) {
        console.log('[write_settings] Creating DTC_APP_DIR:', dtcAppDir);
        await mkdir(dtcAppDir, { recursive: true });
      }

      // Write primary settings file
      await writeTextFile(primaryPath, jsonContent);
      console.log('[write_settings] Primary settings.json written successfully');

    } catch (writeError) {
      console.error('[write_settings] Primary write error:', writeError);
      return {
        code: 1,
        result: false,
        error: [{ code: 8, message: 'File write error', details: writeError.message }]
      };
    }

    // Write to backup location: STASH_DIR/App_Data/settings.json (optional)
    if (stashDir) {
      const backupDir = `${stashDir}/App_Data`;
      const backupPath = `${backupDir}/settings.json`;

      try {
        // Ensure backup directory exists
        const backupDirExists = await exists(backupDir);
        if (!backupDirExists) {
          console.log('[write_settings] Creating backup directory:', backupDir);
          await mkdir(backupDir, { recursive: true });
        }

        // Write backup settings file
        await writeTextFile(backupPath, jsonContent);
        console.log('[write_settings] Backup settings.json written successfully');

      } catch (backupError) {
        // Log warning but don't fail - backup is optional
        console.warn('[write_settings] Backup write failed (non-critical):', backupError);
      }
    } else {
      console.log('[write_settings] STASH_DIR not configured, skipping backup');
    }

    // Update appState with new settings
    appState.settings = { ...appState.settings, ...settings_object };

    console.log('[write_settings] Completed successfully');
    return {
      code: 0,
      result: true,
      error: []
    };

  } catch (error) {
    console.error('[write_settings] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
