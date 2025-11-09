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
