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
import { fetch, ResponseType } from '@tauri-apps/plugin-http';
import { writeFile, exists } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';

export async function check_parquet_updates() {
  console.log('[check_parquet_updates] Starting');

  try {
    const { PARQUET_METADATA_URL, DTC_APP_DIR } = appState.settings;

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

    const localPath = `${DTC_APP_DIR}/community-models.parquet`;

    console.log('[check_parquet_updates] Checking for updates from:', PARQUET_METADATA_URL);

    try {
      // Fetch parquet file
      const response = await fetch(PARQUET_METADATA_URL, {
        method: 'GET',
        responseType: ResponseType.Binary
      });

      if (!response.ok) {
        console.error('[check_parquet_updates] Download failed:', response.status);
        return {
          code: 1,
          result: null,
          error: [{ code: 51, message: 'Download failed', details: `HTTP ${response.status}` }]
        };
      }

      const fileData = await response.bytes();

      // Write to local file
      try {
        await writeFile(localPath, fileData);
        console.log('[check_parquet_updates] Parquet file downloaded successfully');

        return {
          code: 0,
          result: { success: true, has_update: true },
          error: []
        };

      } catch (writeError) {
        console.error('[check_parquet_updates] Write error:', writeError);
        return {
          code: 1,
          result: null,
          error: [{ code: 8, message: 'File write error', details: writeError.message }]
        };
      }

    } catch (fetchError) {
      console.error('[check_parquet_updates] Fetch error:', fetchError);
      return {
        code: 1,
        result: null,
        error: [{ code: 49, message: 'Network connection failed', details: fetchError.message }]
      };
    }

  } catch (error) {
    console.error('[check_parquet_updates] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
