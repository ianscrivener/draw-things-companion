import { app_init } from './app_init.js';

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
