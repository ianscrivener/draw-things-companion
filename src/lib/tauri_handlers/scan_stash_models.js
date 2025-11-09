import { load_config } from './app_init.js';

// ############################################################################
/**
 * scan_stash_models
 *
 * Scans the Stash directory for model files and updates database to mark them
 * as exists_stash = true. This allows models that have been copied to the stash
 * to appear in the Stash pane.
 *
 * @param {string} modelType - Type of model: 'model', 'lora', or 'control'
 * @param {Object} config - Configuration object with STASH_DIR (optional, will load if not provided)
 * @returns {Promise<Object>} Scan results:
 *   {
 *     found: number,      // Number of models found in stash
 *     updated: number,    // Number of existing records marked as exists_stash
 *     imported: number,   // Number of new records imported from stash
 *     errors: Array       // Any errors encountered
 *   }
 */
export async function scan_stash_models(modelType, config = null) {
  try {
    console.log('[tauri_handler] scan_stash_models - starting for type:', modelType);

    const results = {
      found: 0,
      updated: 0,
      imported: 0,  // New files added to database
      errors: []
    };

    // Load config if not provided
    if (!config) {
      config = await load_config();
    }

    if (!config.STASH_DIR) {
      throw new Error('STASH_DIR not configured');
    }

    console.log('[tauri_handler] scan_stash_models - config.STASH_DIR:', config.STASH_DIR);

    const { readDir, stat } = await import('@tauri-apps/plugin-fs');
    const { join } = await import('@tauri-apps/api/path');
    const Database = (await import('@tauri-apps/plugin-sql')).default;

    // Map model type to subdirectory in stash
    const stashSubdirs = {
      'model': 'Models',
      'lora': 'Models',  // All model files are in Models directory
      'control': 'Models'
    };

    const stashSubdir = stashSubdirs[modelType];
    if (!stashSubdir) {
      throw new Error(`Unknown model type: ${modelType}`);
    }

    // Get path to stash models directory
    const stashModelsDir = await join(config.STASH_DIR, stashSubdir);
    console.log('[tauri_handler] Scanning stash directory:', stashModelsDir);

    // Read directory contents
    let entries = [];
    try {
      entries = await readDir(stashModelsDir);
      console.log('[tauri_handler] Found', entries.length, 'entries in stash');
    } catch (dirError) {
      console.warn('[tauri_handler] Could not read stash directory:', dirError.message);
      return {
        found: 0,
        updated: 0,
        imported: 0,
        errors: [{ error: `Could not read stash directory: ${dirError.message}` }]
      };
    }

    // Filter for model files (.ckpt, .safetensors, .pth, .pt)
    const modelExtensions = ['.ckpt', '.safetensors', '.pth', '.pt'];
    const modelFiles = entries.filter(entry => {
      if (!entry.name) return false;
      const lowerName = entry.name.toLowerCase();
      return modelExtensions.some(ext => lowerName.endsWith(ext));
    });

    results.found = modelFiles.length;
    console.log('[tauri_handler] Found', modelFiles.length, 'model files in stash');

    // Open database
    const dbPath = await join(config.STASH_DIR, 'App_Data', 'drawthings_companion.sqlite');
    const db = await Database.load(`sqlite:${dbPath}`);

    // For each model file found in stash, update exists_stash to true
    for (const fileEntry of modelFiles) {
      const filename = fileEntry.name;

      try {
        // Check if this file exists in database
        const existing = await db.select(
          'SELECT filename, exists_stash FROM ckpt_models WHERE filename = $1',
          [filename]
        );

        if (existing.length > 0) {
          // File exists in database - update exists_stash to true
          if (!existing[0].exists_stash) {
            await db.execute(
              'UPDATE ckpt_models SET exists_stash = true WHERE filename = $1',
              [filename]
            );
            results.updated++;
            console.log(`[tauri_handler] Marked ${filename} as exists_stash = true`);
          } else {
            console.log(`[tauri_handler] ${filename} already marked as in stash`);
          }
        } else {
          // File is in stash but not in database - import it!
          console.log(`[tauri_handler] Importing new file from stash: ${filename}`);

          // Get file size and path
          const filePath = await join(stashModelsDir, filename);
          let fileSize = 0;
          try {
            const file_stats = await stat(filePath);
            fileSize = file_stats.size;
          } catch (statError) {
            console.warn(`[tauri_handler] Could not stat ${filename}:`, statError.message);
          }

          // Try to detect correct model type from filename
          // This is a heuristic since we don't have DrawThings JSON for these files
          let detectedType = 'model';  // default
          const lowerFilename = filename.toLowerCase();

          if (lowerFilename.includes('lora') || lowerFilename.includes('_lora_')) {
            detectedType = 'lora';
          } else if (lowerFilename.includes('controlnet') || lowerFilename.includes('control_net')) {
            detectedType = 'control';
          } else if (lowerFilename.includes('vae') || lowerFilename.includes('clip') ||
                     lowerFilename.includes('encoder') || lowerFilename.includes('vision')) {
            // These are usually auxiliary model files, but we'll mark as 'model' type
            // In the future, could add specific types for these
            detectedType = 'model';
          }

          console.log(`[tauri_handler] Detected type for ${filename}: ${detectedType}`);

          // Insert into database
          // Note: We don't have display_name_original or mac_display_order since this wasn't in DrawThings
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
              null,              // display_name_original (unknown - not from DrawThings)
              detectedType,      // Use detected type instead of parameter
              fileSize,
              filePath,
              false,             // exists_mac_hd (it's only in stash)
              true,              // exists_stash
              null,              // mac_display_order (not on Mac)
              null               // lora_strength (unknown)
            ]
          );

          results.imported++;
          console.log(`[tauri_handler] Imported ${filename} from stash as type ${detectedType}`);
        }
      } catch (fileError) {
        console.error('[tauri_handler] Error processing file:', filename, fileError);
        results.errors.push({
          filename,
          error: fileError.message
        });
      }
    }

    // Also check for files that are marked as exists_stash but no longer exist in stash
    // This keeps the database in sync if files were manually deleted
    try {
      const stashRecords = await db.select(
        'SELECT filename FROM ckpt_models WHERE model_type = $1 AND exists_stash = true',
        [modelType]
      );

      for (const record of stashRecords) {
        const filename = record.filename;
        const filePath = await join(stashModelsDir, filename);

        try {
          await stat(filePath);
          // File exists, no action needed
        } catch (statError) {
          // File doesn't exist - mark as not in stash
          await db.execute(
            'UPDATE ckpt_models SET exists_stash = false WHERE filename = $1',
            [filename]
          );
          console.log(`[tauri_handler] Marked ${filename} as exists_stash = false (file not found)`);
        }
      }
    } catch (syncError) {
      console.warn('[tauri_handler] Error syncing stash status:', syncError.message);
    }

    // Close database
    await db.close();

    console.log('[tauri_handler] scan_stash_models completed:', results);
    return results;

  } catch (error) {
    console.error('[tauri_handler] scan_stash_models error:', error);
    return {
      found: 0,
      updated: 0,
      imported: 0,
      errors: [{ error: error.message }]
    };
  }
}
