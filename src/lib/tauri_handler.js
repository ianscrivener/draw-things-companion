// ############################################################################
/**
 * Tauri Backend Handler
 *
 * Central module for all frontend-to-backend communication.
 * All Tauri invoke() calls should go through this module.
 *
 * This provides a clean abstraction layer between the frontend and backend,
 * making it easy to mock, test, or replace backend implementations.
 */

import { invoke } from '@tauri-apps/api/core';

// ############################################################################
// ############################################################################
// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

// ############################################################################
/**
 * rescan_all_models
 *
 * Manually trigger a full rescan of all model types.
 * Useful for repopulating database or importing new models.
 *
 * @returns {Promise<Object>} Combined scan results for all types
 */
export async function rescan_all_models() {
  try {
    console.log('[tauri_handler] rescan_all_models - starting full rescan');

    const modelScan = await scan_mac_models('model');
    const loraScan = await scan_mac_models('lora');
    const controlScan = await scan_mac_models('control');

    const results = {
      models: modelScan,
      loras: loraScan,
      controlnets: controlScan,
      total_found: modelScan.found + loraScan.found + controlScan.found,
      total_imported: modelScan.imported + loraScan.imported + controlScan.imported,
      total_skipped: modelScan.skipped + loraScan.skipped + controlScan.skipped
    };

    console.log('[tauri_handler] rescan_all_models completed:', results);
    return results;

  } catch (error) {
    console.error('[tauri_handler] rescan_all_models error:', error);
    throw error;
  }
}

// ############################################################################
/**
 * init_database
 *
 * Creates the SQLite database and tables if they don't exist.
 * Should be called during app initialization.
 *
 * @param {string} stashDir - Path to stash directory
 * @returns {Promise<void>}
 */
export async function init_database(stashDir) {
  try {
    console.log('[tauri_handler] init_database - starting');

    const Database = (await import('@tauri-apps/plugin-sql')).default;
    const { join } = await import('@tauri-apps/api/path');
    const { exists, mkdir } = await import('@tauri-apps/plugin-fs');

    // Ensure App_Data directory exists
    const appDataDir = await join(stashDir, 'App_Data');
    const appDataExists = await exists(appDataDir);
    if (!appDataExists) {
      console.log('[tauri_handler] Creating App_Data directory:', appDataDir);
      await mkdir(appDataDir, { recursive: true });
    }

    // Open/create database
    const dbPath = await join(stashDir, 'App_Data', 'drawthings_companion.sqlite');
    console.log('[tauri_handler] Opening database at:', dbPath);
    const db = await Database.load(`sqlite:${dbPath}`);

    // Create ckpt_models table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ckpt_models (
        filename TEXT PRIMARY KEY NOT NULL,
        display_name_original TEXT,
        display_name TEXT,
        model_type TEXT NOT NULL,
        file_size INTEGER,
        checksum TEXT,
        source_path TEXT,
        exists_mac_hd BOOLEAN DEFAULT FALSE,
        exists_stash BOOLEAN DEFAULT FALSE,
        mac_display_order INTEGER,
        lora_strength INTEGER,
        created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
        updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
      )
    `);

    // Create ckpt_x_ckpt table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ckpt_x_ckpt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_ckpt_filename TEXT NOT NULL,
        child_ckpt_filename TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
        UNIQUE(parent_ckpt_filename, child_ckpt_filename),
        FOREIGN KEY (parent_ckpt_filename) REFERENCES ckpt_models(filename) ON DELETE CASCADE,
        FOREIGN KEY (child_ckpt_filename) REFERENCES ckpt_models(filename) ON DELETE CASCADE
      )
    `);

    // Create config table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
      )
    `);

    await db.close();

    console.log('[tauri_handler] init_database - completed successfully');

  } catch (error) {
    console.error('[tauri_handler] init_database error:', error);
    throw error;
  }
}


// ############################################################################
// ############################################################################
// ============================================================================
// MODEL MANAGEMENT
// ============================================================================


// ############################################################################
/**
 * get_models
 *
 * Retrieves all models of a specific type with their Mac HD status and display order.
 *
 * @param {string} modelType - Type of model: 'model', 'lora', or 'control'
 * @returns {Promise<Array>} Array of model objects with structure:
 *   [{
 *     filename: string,                  // Primary key - actual file name
 *     display_name_original: string|null, // Original name from DrawThings JSON
 *     display_name: string|null,         // User's custom display name (editable)
 *     model_type: string,                // Type (model/lora/control/etc)
 *     file_size: number|null,            // Size in bytes
 *     checksum: string|null,             // SHA256 hash
 *     source_path: string|null,          // Original file path
 *     exists_mac_hd: boolean,            // Whether model is on Mac HD
 *     exists_stash: boolean,             // Whether model is in Stash
 *     mac_display_order: number|null,    // Order on Mac (null if not on Mac)
 *     lora_strength: number|null,        // LoRA strength × 10 (e.g., 75 = 7.5)
 *     created_at: string,                // ISO timestamp
 *     updated_at: string                 // ISO timestamp
 *   }]
 */
export async function get_models(modelType) {
  try {
    console.log('[tauri_handler] get_models - starting for type:', modelType);

    // Load config to get STASH_DIR
    const config = await app_init();

    if (!config.STASH_DIR) {
      console.error('[tauri_handler] get_models - STASH_DIR not configured');
      return [];
    }

    // Import Database dynamically
    const Database = (await import('@tauri-apps/plugin-sql')).default;
    const { join } = await import('@tauri-apps/api/path');

    // Open database connection
    const dbPath = await join(config.STASH_DIR, 'App_Data', 'drawthings_companion.sqlite');
    console.log('[tauri_handler] get_models - opening database at:', dbPath);

    const db = await Database.load(`sqlite:${dbPath}`);

    // Query models of specified type, ordered by mac_display_order (nulls last)
    // Display logic: prefer display_name (custom), fallback to display_name_original, then filename
    const query = `
      SELECT
        filename,
        display_name_original,
        display_name,
        model_type,
        file_size,
        checksum,
        source_path,
        exists_mac_hd,
        exists_stash,
        mac_display_order,
        lora_strength,
        created_at,
        updated_at
      FROM ckpt_models
      WHERE model_type = $1
      ORDER BY
        CASE WHEN mac_display_order IS NULL THEN 1 ELSE 0 END,
        mac_display_order,
        COALESCE(display_name, display_name_original, filename)
    `;

    const models = await db.select(query, [modelType]);

    // Close database connection
    await db.close();

    console.log('[tauri_handler] get_models - found', models.length, 'models of type', modelType);

    return models;

  } catch (error) {
    console.error('[tauri_handler] get_models error:', error);
    // Return empty array to prevent crashes
    return [];
  }
}

// ############################################################################
/**
 * add_model_to_mac
 *
 * Adds a model to Mac HD with specified display order.
 * Updates the database to mark model as being on Mac.
 *
 * @param {string} modelId - Model filename/ID
 * @param {number} displayOrder - Position in Mac HD list (0-based)
 * @returns {Promise<void>}
 */
export async function add_model_to_mac(modelId, displayOrder) {
  try {
    return await invoke('add_model_to_mac', { modelId, displayOrder });
  } catch (error) {
    console.error('[tauri_handler] add_model_to_mac error:', error);
    throw error;
  }
}

// ############################################################################
/**
 * remove_model_from_mac
 *
 * Removes a model from Mac HD (keeps it in stash).
 * Updates the database to mark model as not on Mac.
 *
 * @param {string} modelId - Model filename/ID
 * @returns {Promise<void>}
 */
export async function remove_model_from_mac(modelId) {
  try {
    return await invoke('remove_model_from_mac', { modelId });
  } catch (error) {
    console.error('[tauri_handler] remove_model_from_mac error:', error);
    throw error;
  }
}

// ############################################################################
/**
 * update_models_order
 *
 * Batch updates display order for all Mac models.
 * Used after drag-and-drop reordering.
 *
 * @param {Array<[string, number]>} updates - Array of [modelId, displayOrder] tuples
 * @returns {Promise<void>}
 */
export async function update_models_order(updates) {
  try {
    return await invoke('update_models_order', { updates });
  } catch (error) {
    console.error('[tauri_handler] update_models_order error:', error);
    throw error;
  }
}

// ############################################################################
/**
 * scan_mac_models
 *
 * Scans DrawThings directory for models and imports them into database.
 * Reads DrawThings JSON files for metadata and display order.
 *
 * @param {string} modelType - Type of model: 'model', 'lora', or 'control'
 * @returns {Promise<Object>} Scan results:
 *   {
 *     found: number,      // Number of models found
 *     imported: number,   // Number of new models imported
 *     skipped: number,    // Number already in database
 *     errors: Array       // Any errors encountered
 *   }
 */
export async function scan_mac_models(modelType) {
  try {
    console.log('[tauri_handler] scan_mac_models - starting for type:', modelType);

    const results = {
      found: 0,
      imported: 0,
      skipped: 0,
      errors: []
    };

    // Load config to get directories
    const config = await app_init();
    if (!config.DT_BASE_DIR || !config.STASH_DIR) {
      throw new Error('DT_BASE_DIR or STASH_DIR not configured');
    }

    console.log('[tauri_handler] scan_mac_models - config.DT_BASE_DIR:', config.DT_BASE_DIR);
    console.log('[tauri_handler] scan_mac_models - config.STASH_DIR:', config.STASH_DIR);

    const { readTextFile, readDir } = await import('@tauri-apps/plugin-fs');
    const { join } = await import('@tauri-apps/api/path');
    const Database = (await import('@tauri-apps/plugin-sql')).default;

    // Map model type to JSON filename
    const jsonFilenames = {
      'model': 'custom.json',
      'lora': 'custom_lora.json',
      'control': 'custom_controlnet.json'
    };

    const jsonFilename = jsonFilenames[modelType];
    if (!jsonFilename) {
      throw new Error(`Unknown model type: ${modelType}`);
    }

    // Read DrawThings JSON file for metadata and display order
    const jsonPath = await join(config.DT_BASE_DIR, 'Models', jsonFilename);
    console.log('[tauri_handler] Reading JSON from:', jsonPath);

    let jsonData = [];
    try {
      const jsonContent = await readTextFile(jsonPath);
      jsonData = JSON.parse(jsonContent);
      console.log('[tauri_handler] Found', jsonData.length, 'entries in JSON for type:', modelType);
    } catch (jsonError) {
      console.warn('[tauri_handler] Could not read JSON file:', jsonError.message);
      // If JSON doesn't exist, can't determine which files belong to this type
      return {
        found: 0,
        imported: 0,
        skipped: 0,
        errors: [{ error: `Could not read ${jsonFilename}: ${jsonError.message}` }]
      };
    }

    // Extract filenames from JSON - these are the ONLY files that belong to this model type
    const filesToImport = [];
    for (let i = 0; i < jsonData.length; i++) {
      const entry = jsonData[i];
      if (entry.file) {
        filesToImport.push({
          filename: entry.file,
          jsonEntry: entry,
          order: i
        });
      }
    }

    results.found = filesToImport.length;
    console.log('[tauri_handler] Will import', filesToImport.length, 'files for type:', modelType);

    // Open database
    const modelsDir = await join(config.DT_BASE_DIR, 'Models');
    const dbPath = await join(config.STASH_DIR, 'App_Data', 'drawthings_companion.sqlite');
    const db = await Database.load(`sqlite:${dbPath}`);

    // Process each file from JSON
    for (const fileInfo of filesToImport) {
      const filename = fileInfo.filename;
      const jsonEntry = fileInfo.jsonEntry;

      try {
        // Check if already in database
        const existing = await db.select(
          'SELECT filename FROM ckpt_models WHERE filename = $1',
          [filename]
        );

        if (existing.length > 0) {
          results.skipped++;
          console.log(`[tauri_handler] Skipping ${filename} (already in database)`);
          continue;
        }

        // Extract metadata from JSON entry
        const displayNameOriginal = jsonEntry.name || null;
        const loraStrength = modelType === 'lora' && jsonEntry.strength
          ? Math.round(jsonEntry.strength * 10)
          : null;

        // Display order is the position in JSON array
        const macDisplayOrder = fileInfo.order;

        // Get file size
        const filePath = await join(modelsDir, filename);
        let fileSize = null;
        try {
          // Use Tauri's metadata if available, otherwise skip
          const { metadata } = await import('@tauri-apps/plugin-fs');
          const meta = await metadata(filePath);
          fileSize = meta.size;
        } catch (sizeError) {
          console.warn('[tauri_handler] Could not get file size for:', filename);
        }

        // Insert into database
        await db.execute(
          `INSERT INTO ckpt_models (
            filename,
            display_name_original,
            model_type,
            file_size,
            source_path,
            exists_mac_hd,
            exists_stash,
            mac_display_order,
            lora_strength
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            filename,
            displayNameOriginal,
            modelType,
            fileSize,
            filePath,
            true,  // exists_mac_hd (we're scanning from Mac)
            false, // exists_stash (not copied yet)
            macDisplayOrder,
            loraStrength
          ]
        );

        results.imported++;
        console.log(`[tauri_handler] Imported ${filename}`);

      } catch (fileError) {
        console.error('[tauri_handler] Error processing file:', filename, fileError);
        results.errors.push({
          filename,
          error: fileError.message
        });
      }
    }

    // Close database
    await db.close();

    console.log('[tauri_handler] scan_mac_models completed:', results);
    return results;

  } catch (error) {
    console.error('[tauri_handler] scan_mac_models error:', error);
    return {
      found: 0,
      imported: 0,
      skipped: 0,
      errors: [{ error: error.message }]
    };
  }
}

// ############################################################################
/**
 * delete_model
 *
 * Deletes model from database and optionally from disk.
 * If model is on Mac HD, it will be removed from there as well.
 *
 * @param {string} modelId - Model filename/ID
 * @param {boolean} deleteFiles - Whether to also delete files from disk
 * @returns {Promise<void>}
 */
export async function delete_model(modelId, deleteFiles) {
  try {
    return await invoke('delete_model', { modelId, deleteFiles });
  } catch (error) {
    console.error('[tauri_handler] delete_model error:', error);
    throw error;
  }
}


// ############################################################################
// ############################################################################
// ============================================================================
// APP INITIALIZATION & SETTINGS MANAGEMENT
// ============================================================================

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
        console.log('[tauri_handler] Trying .env at:', path);
        envContent = await readTextFile(path);
        envFound = true;
        console.log('[tauri_handler] Successfully loaded .env file from:', path);
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

    console.log('[tauri_handler] Final env config:', envConfig);

    // Try to load settings.json (overrides .env)
    let settingsConfig = {};
    try {
      settingsConfig = await load_settings();
      console.log('[tauri_handler] Loaded settings.json overrides:', Object.keys(settingsConfig));
    } catch (error) {
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

// ############################################################################
/**
 * load_settings
 *
 * Loads settings from settings.json.
 * Tries DTC_APP_DIR first, then STASH_DIR/App_Data as fallback.
 *
 * @returns {Promise<Object>} Settings object from JSON file
 */
export async function load_settings() {
  try {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    const { join, homeDir } = await import('@tauri-apps/api/path');

    // Try loading from DTC_APP_DIR first (~/.drawthings_companion/settings.json)
    try {
      const home = await homeDir();
      const dtcAppPath = await join(home, '.drawthings_companion', 'settings.json');
      const content = await readTextFile(dtcAppPath);
      const settings = JSON.parse(content);
      console.log('[tauri_handler] load_settings from DTC_APP_DIR:', dtcAppPath);
      return settings;
    } catch (dtcError) {
      console.log('[tauri_handler] Settings not found in DTC_APP_DIR, trying STASH_DIR');
    }

    // Fallback: try loading from STASH_DIR/App_Data/settings.json
    // This requires we already know the STASH_DIR from .env
    // For now, return empty object if DTC_APP_DIR doesn't have it
    console.log('[tauri_handler] No settings found, returning empty object');
    return {};

  } catch (error) {
    console.log('[tauri_handler] load_settings error:', error.message);
    return {};
  }
}

// ############################################################################
/**
 * save_settings
 *
 * Saves settings to TWO locations:
 * 1. [DTC_APP_DIR]/settings.json (~/.drawthings_companion/settings.json)
 * 2. [STASH_DIR]/App_Data/settings.json
 *
 * Creates directories if they don't exist.
 * NEVER saves to DT_BASE_DIR.
 *
 * @param {Object} settings - Settings object to save (must include STASH_DIR)
 * @returns {Promise<void>}
 */
export async function save_settings(settings) {
  try {
    const { writeTextFile, exists, mkdir } = await import('@tauri-apps/plugin-fs');
    const { join, homeDir } = await import('@tauri-apps/api/path');

    const content = JSON.stringify(settings, null, 2);
    const home = await homeDir();

    // 1. Save to DTC_APP_DIR (~/.drawthings_companion/settings.json)
    const dtcAppDir = await join(home, '.drawthings_companion');
    const dtcAppDirExists = await exists(dtcAppDir);
    if (!dtcAppDirExists) {
      console.log('[tauri_handler] Creating DTC_APP_DIR:', dtcAppDir);
      await mkdir(dtcAppDir, { recursive: true });
    }
    const dtcSettingsPath = await join(dtcAppDir, 'settings.json');
    await writeTextFile(dtcSettingsPath, content);
    console.log('[tauri_handler] Saved settings to DTC_APP_DIR:', dtcSettingsPath);

    // 2. Save to STASH_DIR/App_Data/settings.json (if STASH_DIR is set)
    if (settings.STASH_DIR) {
      const stashAppDataDir = await join(settings.STASH_DIR, 'App_Data');
      const stashAppDataExists = await exists(stashAppDataDir);
      if (!stashAppDataExists) {
        console.log('[tauri_handler] Creating STASH_DIR/App_Data:', stashAppDataDir);
        await mkdir(stashAppDataDir, { recursive: true });
      }
      const stashSettingsPath = await join(stashAppDataDir, 'settings.json');
      await writeTextFile(stashSettingsPath, content);
      console.log('[tauri_handler] Saved settings to STASH_DIR:', stashSettingsPath);
    }

  } catch (error) {
    console.error('[tauri_handler] save_settings error:', error);
    throw error;
  }
}


// ############################################################################
// ############################################################################
// ============================================================================
// CONFIGURATION
// ============================================================================

// ############################################################################
/**
 * get_config_value
 *
 * Reads a configuration value from the backend config store.
 *
 * @param {string} key - Configuration key to retrieve
 * @returns {Promise<string|null>} Configuration value or null if not set
 */
export async function get_config_value(key) {
  try {
    return await invoke('get_config_value', { key });
  }
  catch (error) {
    console.error('[tauri_handler] get_config_value error:', error);
    // Return null to indicate value not found
    return null;
  }
}

// ############################################################################
/**
 * app_first_run
 *
 * First-run setup: creates stash directory, saves initial configuration, and initializes database.
 * This is frontend-only logic - no backend call needed.
 *
 * @param {string} dtBaseDir - DrawThings base directory path
 * @param {string} stashDir - Stash directory path for model backups
 * @returns {Promise<void>}
 */
export async function app_first_run(dtBaseDir, stashDir) {
  try {
    console.log('[tauri_handler] app_first_run - creating directories and saving settings');

    // Save settings to both DTC_APP_DIR and STASH_DIR/App_Data
    const settings = {
      DT_BASE_DIR: dtBaseDir,
      STASH_DIR: stashDir,
      initialized: true,
      initialized_date: new Date().toISOString()
    };

    await save_settings(settings);

    // Initialize database
    console.log('[tauri_handler] app_first_run - initializing database');
    await init_database(stashDir);

    console.log('[tauri_handler] app_first_run completed successfully');
  } catch (error) {
    console.error('[tauri_handler] app_first_run error:', error);
    throw error;
  }
}

// ############################################################################
/**
 * update_stash_dir
 *
 * Updates the stash directory path in configuration.
 *
 * @param {string} newStashDir - New stash directory path
 * @returns {Promise<void>}
 */
export async function update_stash_dir(newStashDir) {
  try {
    return await invoke('update_stash_dir', { newStashDir });
  } catch (error) {
    console.error('[tauri_handler] update_stash_dir error:', error);
    throw error;
  }
}


// ############################################################################
// ############################################################################
// ============================================================================
// LOGGING
// ============================================================================


// ############################################################################
/**
 * get_all_logs
 *
 * Retrieves all historical log entries from backend.
 *
 * @returns {Promise<Array>} Array of log entries:
 *   [{
 *     timestamp: string,  // ISO timestamp
 *     level: string,      // Log level (info, warn, error, debug)
 *     message: string     // Log message
 *   }]
 */
export async function get_all_logs() {
  try {
    return await invoke('get_all_logs');
  } catch (error) {
    console.error('[tauri_handler] get_all_logs error:', error);
    // Return empty array to prevent crashes
    return [];
  }
}

// ############################################################################
// ############################################################################
// ============================================================================
// RE-EXPORTS (for compatibility with existing code)
// ============================================================================

// Re-export common Tauri APIs that might be needed
export { invoke } from '@tauri-apps/api/core';
export { listen, emit } from '@tauri-apps/api/event';
export { open } from '@tauri-apps/plugin-dialog';
