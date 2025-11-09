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
      // console.log('[tauri_handler] load_settings from DTC_APP_DIR:', dtcAppPath);
      return settings;
    }
    catch (dtcError) {
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
