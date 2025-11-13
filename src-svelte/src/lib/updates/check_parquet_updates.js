/**
 * check_parquet_updates - Checks for more updated parquet file and downloads if required
 *
 * @returns {Object} { code: 0|1, result: [success_bool, has_update], error: [] }
 *
 * ERROR CODES:
 * 49 - Network connection failed
 * 51 - Download failed
 * 53 - Parquet file unavailable
 * 3 - Insufficient disk space
 * 8 - File write error
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Checks for updated model metadata parquet datasets.
 * - Fetch metadata from remote source per settings.PARQUET_METADATA_URL
 * - Compare version/timestamp with local parquet files
 * - If newer available: download to DTC_APP_DIR
 * - Parquet files contain model info (names, categories, tags, etc.)
 * - Used as fallback/reference when model not in DrawThings JSON
 */
// import { fetch } from '@tauri-apps/plugin-http';
// import { writeFile, exists } from '@tauri-apps/plugin-fs';

import { Command } from '@tauri-apps/plugin-shell';

import { appState } from '../../appState.svelte.js';


export async function check_parquet_updates() {

  try {
    const { PARQUET_METADATA_URL, DTC_APP_DIR, STASH_DIR } = appState.settings;

    if (!PARQUET_METADATA_URL) {
      console.error('[check_parquet_updates] Parquet URL not configured');
      return {
        code: 1,
        result: null,
        error: [{ code: 53, message: 'Parquet file unavailable', details: 'URL not configured' }]
      };
    }

    if (!DTC_APP_DIR) {
      console.error('[check_parquet_updates] DTC_APP_DIR not configured');
      return {
        code: 1,
        result: null,
        error: [{ code: 100, message: 'Unknown error', details: 'DTC_APP_DIR not configured' }]
      };
    }

    const localPath = `${STASH_DIR}/App_Data/community-models.parquet`;

    console.log('[check_parquet_updates] Checking for updates from:', PARQUET_METADATA_URL, 'Save parquet to:', localPath);

    const command = Command.create('wget', ['--no-clobber', '--no-cache', '-O', localPath, PARQUET_METADATA_URL]);

    command.on('close', data => {
      console.log(`command finished with code ${data.code} and signal ${data.signal}`)
    });

    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', line => console.log(`command stderr: "${line}"`));

    const child = await command.execute();
    console.log(child.stderr);

    appState.init.get_parquet = true;

  }
  catch (error) {
    console.error('[check_parquet_updates] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
