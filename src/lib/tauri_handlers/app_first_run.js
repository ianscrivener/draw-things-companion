import { save_settings } from './save_settings.js';
import { init_database } from './init_database.js';

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
