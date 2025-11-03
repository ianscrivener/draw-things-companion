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
