/**
 * app_init - Initiates the app setup
 *
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 12 - Directory creation failed
 * 13 - Directory not writable
 * 8 - File write error
 * 18 - DT_BASE_DIR not configured
 * 19 - STASH_DIR not configured
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * First-time setup and initialization of the application.
 * - Create DTC_APP_DIR (~/.drawthings_companion/) if doesn't exist
 * - Initialize ~/.drawthings_companion/settings.json with defaults from .env IF IT DOES NOT EXIST
 * - Set initialized=true and initialized_date in settings.json
 * - SKIP init if has already been run
 */
import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { read_settings } from '../settings/read_settings.js';
import { write_settings } from '../settings/write_settings.js';
import { appState } from '../../appState.svelte.js';

// ###############################################################################
export async function app_init() {
  console.log('[app_init] Starting');

  try {
    // Step 1: Load settings to check if already initialized
    const settingsResult = await read_settings();

    if (settingsResult.code === 0 && settingsResult.result.initialized) {
      console.log('[app_init] (1) Already initialized, skipping init');
      appState.init.app_init = true;
      return {
        code: 0,
        result: true,
        error: []
      };
    }

    const settings = settingsResult.result || {};

    // Step 2: Ensure DTC_APP_DIR is configured
    if (!settings.DTC_APP_DIR) {
      console.error('[app_init] (2) DTC_APP_DIR not configured');
      return {
        code: 1,
        result: false,
        error: [{ code: 18, message: 'DT_BASE_DIR not configured' }]
      };
    }

    // Step 3: Create DTC_APP_DIR if it doesn't exist
    try {
      const dirExists = await exists(settings.DTC_APP_DIR);
      if (!dirExists) {
        console.log('[app_init] (3) Creating DTC_APP_DIR:', settings.DTC_APP_DIR);
        await mkdir(settings.DTC_APP_DIR, { recursive: true });
      }
    }
    catch (error) {
      console.error('[app_init] (4) Failed to create directory:', error);
      return {
        code: 1,
        result: false,
        error: [{ code: 12, message: 'Directory creation failed', details: error.message }]
      };
    }

    // Step 4: Create/update settings.json with initialized flag
    const newSettings = {
      ...settings,
      initialized: true,
      initialized_date: new Date().toISOString()
    };

    const writeResult = await write_settings(newSettings);

    if (writeResult.code !== 0) {
      console.error('[app_init] Failed to write settings');
      return writeResult;
    }

    console.log('[app_init] Initialization completed successfully');
    appState.init.app_init = true;
    return {
      code: 0,
      result: true,
      error: []
    };

  }
  catch (error) {
    console.error('[app_init] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
