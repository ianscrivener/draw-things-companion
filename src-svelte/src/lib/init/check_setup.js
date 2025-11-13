/**
 * check_setup - Checks that the application is set up correctly
 *
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 11 - Directory not found
 * 13 - Directory not writable
 * 14 - Directory not readable
 * 15 - Settings file missing
 * 16 - Settings file invalid JSON
 * 18 - DT_BASE_DIR not configured
 * 19 - STASH_DIR not configured
 * 20 - DT_BASE_DIR path invalid
 * 21 - STASH_DIR path invalid
 * 22 - DT_BASE_DIR not accessible
 * 23 - STASH_DIR not accessible
 * 54 - App not initialized
 * 55 - First-time setup incomplete
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Validates that all required paths and configurations exist.
 * - Check DTC_APP_DIR exists and is writable
 * - Check settings.json exists and is valid JSON
 * - Check DT_BASE_DIR (DrawThings directory) exists and is readable
 * - Check STASH_DIR exists (or prompt user to configure)
 * - Return detailed error messages for any missing/invalid components
 * - Called on app startup before main UI loads
 */
import { exists } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';
import { read_settings } from '../settings/read_settings.js';

export async function check_setup() {
  console.log('[check_setup] Starting');

  try {
    // First, load settings (this also validates paths)
    const settingsResult = await read_settings();

    if (settingsResult.code !== 0) {
      console.error('[check_setup] Failed to load settings');
      return settingsResult;
    }

    const settings = settingsResult.result;
    const errors = [];

    // Check DTC_APP_DIR
    if (!settings.DTC_APP_DIR) {
      errors.push({ code: 18, message: 'DT_BASE_DIR not configured' });
    }
    else {
      try {
        const dtcAppDirExists = await exists(settings.DTC_APP_DIR);
        if (!dtcAppDirExists) {
          errors.push({ code: 11, message: 'Directory not found', details: `DTC_APP_DIR: ${settings.DTC_APP_DIR}` });
        }
      }
      catch (error) {
        errors.push({ code: 11, message: 'Directory not found', details: `Cannot access DTC_APP_DIR: ${error.message}` });
      }
    }

    // Check DT_BASE_DIR (DrawThings directory)
    if (!settings.DT_BASE_DIR) {
      errors.push({ code: 18, message: 'DT_BASE_DIR not configured' });
    }
    else {
      try {
        const dtBaseDirExists = await exists(settings.DT_BASE_DIR);
        if (!dtBaseDirExists) {
          errors.push({ code: 22, message: 'DT_BASE_DIR not accessible', details: settings.DT_BASE_DIR });
        }
      }
      catch (error) {
        errors.push({ code: 22, message: 'DT_BASE_DIR not accessible', details: error.message });
      }
    }

    // Check STASH_DIR (optional, but warn if not configured)
    if (!settings.STASH_DIR) {
      errors.push({ code: 19, message: 'STASH_DIR not configured' });
    }
    else {
      try {
        const stashDirExists = await exists(settings.STASH_DIR);
        if (!stashDirExists) {
          errors.push({ code: 23, message: 'STASH_DIR not accessible', details: settings.STASH_DIR });
        }
      }
      catch (error) {
        errors.push({ code: 23, message: 'STASH_DIR not accessible', details: error.message });
      }
    }

    // Check if app has been initialized
    if (!settings.initialized) {
      errors.push({ code: 54, message: 'App not initialized', details: 'Run app_init() first' });
    }

    // Return results
    if (errors.length > 0) {
      console.log('[check_setup] Setup validation failed with', errors.length, 'errors');
      return {
        code: 1,
        result: false,
        error: errors
      };
    }

    console.log('[check_setup] Setup validation passed');
    appState.init.setup_valid = true;
    return {
      code: 0,
      result: true,
      error: []
    };

  }
  catch (error) {
    console.error('[check_setup] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
