/**
 * write_json - Writes the DrawThings JSON file
 *
 * @param {string} location - Location (mac|stash)
 * @param {string} type - Model type (model|lora|control)
 * @param {Object} obj - The object to write
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 40 - JSON write error
 * 8 - File write error
 * 4 - Insufficient permissions
 * 31 - Invalid model type
 * 41 - Invalid JSON structure
 * 42 - JSON file locked
 * 45 - Attempting to write to DT_BASE_DIR (read-only)
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Updates DrawThings' JSON configuration files.
 * - ONLY write to DT_BASE_DIR (Mac) - DrawThings reads from here
 * - Map type to file: model→custom.json, lora→custom_lora.json, control→custom_controlnet.json
 * - Use @tauri-apps/plugin-fs writeTextFile() with JSON.stringify()
 * - Consider backing up original file before writing
 * - Preserve exact JSON structure that DrawThings expects
 * - This modifies DrawThings' config, so be cautious!
 */
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { appState } from '../../appState.svelte.js';

export async function write_json(location, type, obj) {
  console.log(`[write_json] Starting - location: ${location}, type: ${type}`);

  try {
    // Only write to Mac location (DrawThings reads from DT_BASE_DIR)
    if (location !== 'mac') {
      console.warn('[write_json] Can only write to mac location (DT_BASE_DIR)');
      return {
        code: 1,
        result: false,
        error: [{ code: 45, message: 'Attempting to write to DT_BASE_DIR (read-only)', details: 'Only mac location can be written to' }]
      };
    }

    // Map type to correct JSON filename
    const typeToFile = {
      model: 'custom.json',
      lora: 'custom_lora.json',
      control: 'custom_controlnet.json'
    };

    const filename = typeToFile[type];
    if (!filename) {
      console.error('[write_json] Invalid model type:', type);
      return {
        code: 1,
        result: false,
        error: [{ code: 31, message: 'Invalid model type', details: 'Type must be: model, lora, or control' }]
      };
    }

    // Get base directory
    const baseDir = appState.settings.DT_BASE_DIR;
    if (!baseDir) {
      console.error('[write_json] DT_BASE_DIR not configured');
      return {
        code: 1,
        result: false,
        error: [{ code: 18, message: 'DT_BASE_DIR not configured' }]
      };
    }

    // Validate JSON structure
    if (!Array.isArray(obj)) {
      console.error('[write_json] Invalid JSON structure - must be array');
      return {
        code: 1,
        result: false,
        error: [{ code: 41, message: 'Invalid JSON structure', details: 'Expected array format' }]
      };
    }

    // Construct full path
    const jsonPath = `${baseDir}/Models/${filename}`;
    console.log('[write_json] Writing to:', jsonPath);

    try {
      // Write JSON file (pretty-printed)
      const jsonContent = JSON.stringify(obj, null, 2);
      await writeTextFile(jsonPath, jsonContent);

      console.log('[write_json] Successfully wrote JSON file');
      return {
        code: 0,
        result: true,
        error: []
      };

    } catch (writeError) {
      console.error('[write_json] Write error:', writeError);
      return {
        code: 1,
        result: false,
        error: [{ code: 40, message: 'JSON write error', details: writeError.message }]
      };
    }

  } catch (error) {
    console.error('[write_json] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
