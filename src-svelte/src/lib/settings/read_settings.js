/**
 * read_settings - Reads the application settings from the filesystem
 *
 * @returns {Object} { code: 0|1, result: [settings_object], error: [] }
 *
 * ERROR CODES:
 * 15 - Settings file missing
 * 16 - Settings file invalid JSON
 * 17 - Settings file corrupt
 * 7 - File read error
 * 11 - Directory not found
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Loads application configuration with priority: settings.json overrides .env defaults.
 * - Load .env file defaults first
 * - Read settings.json from DTC_APP_DIR using @tauri-apps/plugin-fs
 * - Merge: settings.json values override .env defaults
 * - Expand tilde paths (~) to full paths
 * - Return merged configuration object
 * - If settings.json missing, return .env defaults only
 * - Called at app startup and when settings UI opens
 */

import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import { homeDir } from '@tauri-apps/api/path';
import { appState } from '../../appState.svelte.js';

export async function read_settings() {
  // console.log('[read_settings] Starting');

  const homePath = await homeDir();

  try {
    // Get home directory for path expansion
    const homePath = await homeDir();

    // Helper function to expand ~ in paths
    const expandPath = (path) => {
      if (!path) return path;
      return path.startsWith('~') ? path.replace('~', homePath.replace(/\/$/, '')) : path;
    };

    // Step 1: Load .env defaults
    const envDefaults = {
      DT_BASE_DIR: '~/Library/Containers/com.liuliu.draw-things/Data/Documents',
      STASH_DIR: '/Volumes/Extreme2Tb/__DrawThings_Stash__',
      DTC_APP_DIR: '~/.drawthings_companion',
      GITHUB_OWNER: 'XXX',
      GITHUB_REPO: 'YYY',
      PARQUET_METADATA_URL: 'https://github.com/ianscrivener/drawthings-community-models-extract/raw/refs/heads/main/community-models.parquet',
      initialized: false,
      initialized_date: null,
      locations: ["mac", "stash"],
      ckpt_types: ["model", "lora", "control"],
      ckpt_keys_types: ["file", "clip_encoder", "text_encoder", "autoencoder", "image_encoder", "preprocessor"]

    };

    // Expand paths in defaults
    const expandedDefaults = {
      ...envDefaults,
      DT_BASE_DIR: expandPath(envDefaults.DT_BASE_DIR),
      STASH_DIR: expandPath(envDefaults.STASH_DIR),
      DTC_APP_DIR: expandPath(envDefaults.DTC_APP_DIR)
    };

    // Step 2: Try to read settings.json from DTC_APP_DIR
    const settingsPath = `${expandedDefaults.DTC_APP_DIR}/settings.json`;
    let userSettings = {};

    try {
      const settingsExists = await exists(settingsPath);

      if (settingsExists) {
        const settingsContent = await readTextFile(settingsPath);

        try {
          userSettings = JSON.parse(settingsContent);
          // console.log('[read_settings] Loaded settings.json');
        }
        catch (parseError) {
          console.error('[read_settings] JSON parse error:', parseError);
          return {
            code: 1,
            result: null,
            error: [{ code: 16, message: 'Settings file invalid JSON', details: parseError.message }]
          };
        }
      }
      else {
        console.log('[read_settings] settings.json not found, using .env defaults only');
      }
    }
    catch (readError) {
      console.warn('[read_settings] Could not read settings.json:', readError);
      // Continue with defaults only
    }

    // Step 3: Merge settings (user settings override defaults)
    const mergedSettings = {
      ...expandedDefaults,
      ...userSettings
    };

    // Expand any paths in user settings that weren't expanded
    if (userSettings.DT_BASE_DIR) {
      mergedSettings.DT_BASE_DIR = expandPath(userSettings.DT_BASE_DIR);
    }

    if (userSettings.STASH_DIR) {
      mergedSettings.STASH_DIR = expandPath(userSettings.STASH_DIR);
    }

    if (userSettings.DTC_APP_DIR) {
      mergedSettings.DTC_APP_DIR = expandPath(userSettings.DTC_APP_DIR);
    }

    // Update appState with merged settings
    appState.settings = mergedSettings;

    // Update init flag
    appState.init.settings_init = true;

    console.log('[read_settings] Completed successfully');
    return {
      code: 0,
      result: mergedSettings,
      error: []
    };

  }
  catch (error) {
    console.error('[read_settings] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
