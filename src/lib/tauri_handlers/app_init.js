import { load_settings } from './load_settings.js';

// ############################################################################
/**
 * app_init
 *
 * Initializes the application by reading configuration from .env file
 * and merging with settings.json (if it exists in stash directory).
 *
 * Priority: settings.json overrides .env values
 *
 * NOTE: This app ONLY runs in Tauri mode. It is not designed for browser use.
 *
 * Reads the .env file from the project root and parses key-value pairs.
 * Expected .env format:
 *   DT_BASE_DIR=~/Library/Containers/com.liuliu.draw-things/Data/Documents
 *   STASH_DIR=/Volumes/Extreme2Tb/__DrawThings_Stash__
 *   DTC_APP_DIR=~/.drawthings_companion
 *
 * @returns {Promise<Object>} Merged configuration:
 *   {
 *     DT_BASE_DIR: string,     // DrawThings base directory
 *     STASH_DIR: string,       // Stash directory for model backups
 *     DTC_APP_DIR: string      // DrawThings Companion app directory
 *   }
 */
export async function app_init() {
  try {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');

    let envConfig = {};
    let envContent;
    let envFound = false;

    // Try multiple locations for .env file
    const pathsToTry = [
      '.env',           // Current directory
      '../.env',        // Parent directory
      '../../.env',     // Two levels up
      '../../../.env'   // Three levels up
    ];

    for (const path of pathsToTry) {
      try {
        // console.log('[tauri_handler] Trying .env at:', path);
        envContent = await readTextFile(path);
        envFound = true;
        // console.log('[tauri_handler] Successfully loaded .env file from:', path);
        break;
      } catch (error) {
        // Continue to next path
      }
    }

    if (envFound) {
      // Parse .env file content
      const lines = envContent.split('\n');

      for (const line of lines) {
        // Skip empty lines and comments
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }

        // Parse key=value pairs
        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex > 0) {
          const key = trimmed.substring(0, equalsIndex).trim();
          const value = trimmed.substring(equalsIndex + 1).trim();

          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, '');

          envConfig[key] = cleanValue;
        }
      }

      console.log('[tauri_handler] Parsed .env config:', Object.keys(envConfig));

      // Expand ~ to home directory in paths
      const { homeDir } = await import('@tauri-apps/api/path');
      const homePath = await homeDir();
      console.log('[tauri_handler] Home directory:', homePath);

      for (const key in envConfig) {
        if (typeof envConfig[key] === 'string' && envConfig[key].startsWith('~')) {
          const oldValue = envConfig[key];
          envConfig[key] = envConfig[key].replace('~', homePath);
          console.log(`[tauri_handler] Expanded ${key}: ${oldValue} -> ${envConfig[key]}`);
        }
      }
    } else {
      // console.warn('[tauri_handler] Could not find .env file, using defaults');
    }

    // Expand ~ in defaults too
    const { homeDir } = await import('@tauri-apps/api/path');
    const homePath = await homeDir();

    // Ensure we have defaults if .env wasn't loaded
    if (!envConfig.DT_BASE_DIR) {
      envConfig.DT_BASE_DIR = `${homePath}/Library/Containers/com.liuliu.draw-things/Data/Documents`;
    }
    if (!envConfig.STASH_DIR) {
      envConfig.STASH_DIR = '/Volumes/Extreme2Tb/__DrawThings_Stash__';
    }
    if (!envConfig.DTC_APP_DIR) {
      envConfig.DTC_APP_DIR = `${homePath}/.drawthings_companion`;
    }

    // console.log('[tauri_handler] Final env config:', envConfig);

    // Try to load settings.json (overrides .env)
    let settingsConfig = {};
    try {
      settingsConfig = await load_settings();
      // console.log('[tauri_handler] Loaded settings.json overrides:', Object.keys(settingsConfig));
    }
    catch (error) {
      console.log('[tauri_handler] No settings.json found or error loading it:', error.message);
    }

    // Merge configurations (settings.json overrides .env)
    const config = { ...envConfig, ...settingsConfig };

    // Expand ~ in merged config paths
    for (const key in config) {
      if (typeof config[key] === 'string' && config[key].startsWith('~')) {
        config[key] = config[key].replace('~', homePath);
        console.log(`[tauri_handler] Expanded merged ${key}: ${config[key]}`);
      }
    }

    // Validate required keys
    const requiredKeys = ['DT_BASE_DIR'];
    const missingKeys = requiredKeys.filter(key => !config[key]);

    if (missingKeys.length > 0) {
      console.warn('[tauri_handler] Missing required config keys:', missingKeys);
    }

    console.log('[tauri_handler] Final merged config:', config);
    return config;

  } catch (error) {
    console.error('[tauri_handler] app_init error:', error);

    // Return default configuration to prevent crashes (with expanded paths)
    const { homeDir } = await import('@tauri-apps/api/path');
    const homePath = await homeDir();

    return {
      DT_BASE_DIR: `${homePath}/Library/Containers/com.liuliu.draw-things/Data/Documents`,
      STASH_DIR: '/Volumes/Extreme2Tb/__DrawThings_Stash__',
      DTC_APP_DIR: `${homePath}/.drawthings_companion`
    };
  }
}
