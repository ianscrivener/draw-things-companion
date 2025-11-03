import { app_init } from './app_init.js';

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
    // console.log('[tauri_handler] get_models - starting for type:', modelType);

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

  }
  catch (error) {
    console.error('[tauri_handler] get_models error:', error);
    // Return empty array to prevent crashes
    return [];
  }
}
