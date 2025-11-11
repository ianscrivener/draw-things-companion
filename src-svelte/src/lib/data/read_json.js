/**
 * read_json - Reads the DrawThings JSON file
 *
 * @param {string} location - Location (mac|stash)
 * @param {string} type - Model type (model|lora|control)
 * @returns {Object} { code: 0|1, result: [array of ckpt_objects], error: [] }
 *
 * ERROR CODES:
 * 38 - JSON file not found
 * 39 - JSON parse error
 * 7 - File read error
 * 31 - Invalid model type
 * 18 - DT_BASE_DIR not configured
 * 19 - STASH_DIR not configured
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Reads DrawThings' JSON files to get model configuration data.
 * - Map type to correct JSON file: model→custom.json, lora→custom_lora.json, control→custom_controlnet.json
 * - Read from DT_BASE_DIR/Models/ for mac, STASH_DIR/Models/ for stash
 * - Use @tauri-apps/plugin-fs readTextFile() then JSON.parse()
 * - Array position = mac_display_order (CRITICAL for proper categorization)
 * - Return full array of checkpoint objects with all DrawThings metadata
 */
import { readTextFile } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';

export async function read_json(location, type) {
  console.log(`[read_json] Starting - location: ${location}, type: ${type}`);

  try {
    // Map type to correct JSON filename
    const typeToFile = {
      model: 'custom.json',
      lora: 'custom_lora.json',
      control: 'custom_controlnet.json'
    };

    const filename = typeToFile[type];
    if (!filename) {
      console.error('[read_json] Invalid model type:', type);
      return {
        code: 1,
        result: null,
        error: [{ code: 31, message: 'Invalid model type', details: `Type must be: model, lora, or control` }]
      };
    }

    // Determine base directory based on location
    const baseDir = location === 'mac'
      ? appState.settings.DT_BASE_DIR
      : appState.settings.STASH_DIR;

    if (!baseDir) {
      const errorCode = location === 'mac' ? 18 : 19;
      const errorMsg = location === 'mac' ? 'DT_BASE_DIR not configured' : 'STASH_DIR not configured';
      console.error('[read_json]', errorMsg);
      return {
        code: 1,
        result: null,
        error: [{ code: errorCode, message: errorMsg }]
      };
    }

    // Construct full path to JSON file
    const jsonPath = `${baseDir}/Models/${filename}`;
    console.log('[read_json] Reading:', jsonPath);

    try {
      // Read the JSON file
      const jsonContent = await readTextFile(jsonPath);

      try {
        // Parse JSON
        const parsedData = JSON.parse(jsonContent);

        // Validate that it's an array
        if (!Array.isArray(parsedData)) {
          console.error('[read_json] JSON is not an array');
          return {
            code: 1,
            result: null,
            error: [{ code: 39, message: 'JSON parse error', details: 'Expected array format' }]
          };
        }

        console.log(`[read_json] Successfully parsed ${parsedData.length} items`);
        return {
          code: 0,
          result: parsedData,
          error: []
        };

      } catch (parseError) {
        console.error('[read_json] JSON parse error:', parseError);
        return {
          code: 1,
          result: null,
          error: [{ code: 39, message: 'JSON parse error', details: parseError.message }]
        };
      }

    } catch (readError) {
      console.error('[read_json] File read error:', readError);
      // Determine if it's a missing file or read error
      if (readError.message && readError.message.includes('No such file')) {
        return {
          code: 1,
          result: null,
          error: [{ code: 38, message: 'JSON file not found', details: jsonPath }]
        };
      }
      return {
        code: 1,
        result: null,
        error: [{ code: 7, message: 'File read error', details: readError.message }]
      };
    }

  } catch (error) {
    console.error('[read_json] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
