/**
 * set_ckpt - Set various checkpoint metadata such as display name, LoRA strength, etc.
 *
 * @param {string} location - Location (mac|stash)
 * @param {string} type - Model type (model|lora|control)
 * @param {string} ckpt_filename - The checkpoint filename
 * @param {Object} updated_settings_object - The updated settings
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 38 - JSON file not found
 * 39 - JSON parse error
 * 40 - JSON write error
 * 28 - Record not found
 * 41 - Invalid JSON structure
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Updates checkpoint metadata in DrawThings JSON configuration.
 * - Read current JSON array using read_json()
 * - Find checkpoint object by filename
 * - Merge updated_settings_object into checkpoint object (preserve other fields)
 * - Write back using write_json()
 * - Also update in-memory object with same changes for consistency
 * - Common fields: display_name, lora_strength, guidance_scale, etc.
 */
import { read_json } from './read_json.js';
import { write_json } from './write_json.js';
import { upsertCkpt } from '../../appState.svelte.js';

export async function set_ckpt(location, type, ckpt_filename, updated_settings_object) {
  console.log(`[set_ckpt] Starting - ${location} ${type} ${ckpt_filename}`);

  try {
    // Read current JSON array
    const jsonResult = await read_json(location, type);
    if (jsonResult.code !== 0) {
      console.error('[set_ckpt] Failed to read JSON');
      return jsonResult;
    }

    const jsonArray = jsonResult.result;

    // Find checkpoint object by filename
    const ckptIndex = jsonArray.findIndex(item =>
      item.file === ckpt_filename || item.filename === ckpt_filename
    );

    if (ckptIndex === -1) {
      console.error('[set_ckpt] Checkpoint not found in JSON');
      return {
        code: 1,
        result: false,
        error: [{ code: 28, message: 'Record not found', details: `Checkpoint ${ckpt_filename} not found` }]
      };
    }

    // Merge updates into checkpoint object (preserve other fields)
    jsonArray[ckptIndex] = {
      ...jsonArray[ckptIndex],
      ...updated_settings_object
    };

    // Write back using write_json
    const writeResult = await write_json(location, type, jsonArray);
    if (writeResult.code !== 0) {
      console.error('[set_ckpt] Failed to write JSON');
      return writeResult;
    }

    // Update in-memory object with same changes
    upsertCkpt(location, type, jsonArray[ckptIndex]);

    console.log('[set_ckpt] Successfully updated checkpoint');
    return {
      code: 0,
      result: true,
      error: []
    };

  } catch (error) {
    console.error('[set_ckpt] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
