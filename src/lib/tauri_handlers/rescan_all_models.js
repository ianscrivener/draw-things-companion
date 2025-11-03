import { scan_mac_models } from './scan_mac_models.js';

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
