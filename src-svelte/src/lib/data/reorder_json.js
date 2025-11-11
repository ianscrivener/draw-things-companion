/**
 * reorder_json - Sets the order for the JSON file - moving the checkpoint object to the specified position
 *
 * @param {string} location - Location (mac|stash)
 * @param {string} type - Model type (model|lora|control)
 * @param {string} ckpt_filename - The checkpoint filename
 * @param {number} position - The position to move to
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 38 - JSON file not found
 * 39 - JSON parse error
 * 40 - JSON write error
 * 28 - Record not found
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Changes display order of models in DrawThings by reordering JSON array.
 * - Read current JSON array using read_json()
 * - Find the checkpoint object in array
 * - Remove from current position, insert at new position
 * - Write back using write_json()
 * - Updates mac_display_order in in-memory object for affected models
 * - ONLY applies to Mac location (DrawThings reads from DT_BASE_DIR)
 */
import { read_json } from './read_json.js';
import { write_json } from './write_json.js';
import { getCkptsByTypeAndLocation } from '../../appState.svelte.js';

export async function reorder_json(location, type, ckpt_filename, position) {
  console.log(`[reorder_json] Starting - ${location} ${type} ${ckpt_filename} to position ${position}`);

  try {
    // Read current JSON array
    const jsonResult = await read_json(location, type);
    if (jsonResult.code !== 0) {
      console.error('[reorder_json] Failed to read JSON');
      return jsonResult;
    }

    const jsonArray = jsonResult.result;

    // Find the checkpoint object in array
    const ckptIndex = jsonArray.findIndex(item =>
      item.file === ckpt_filename || item.filename === ckpt_filename
    );

    if (ckptIndex === -1) {
      console.error('[reorder_json] Checkpoint not found in JSON');
      return {
        code: 1,
        result: false,
        error: [{ code: 28, message: 'Record not found', details: `Checkpoint ${ckpt_filename} not found` }]
      };
    }

    // Remove from current position
    const [ckptItem] = jsonArray.splice(ckptIndex, 1);

    // Insert at new position
    jsonArray.splice(position, 0, ckptItem);

    // Write back using write_json
    const writeResult = await write_json(location, type, jsonArray);
    if (writeResult.code !== 0) {
      console.error('[reorder_json] Failed to write JSON');
      return writeResult;
    }

    // Update mac_display_order in in-memory object for affected models
    const typeMap = { model: 'models', lora: 'loras', control: 'controls' };
    const ckpts = getCkptsByTypeAndLocation(location, type);

    for (let i = 0; i < jsonArray.length; i++) {
      const ckpt = ckpts.find(c => c.filename === jsonArray[i].file || c.filename === jsonArray[i].filename);
      if (ckpt) {
        ckpt.mac_display_order = i;
      }
    }

    console.log('[reorder_json] Successfully reordered checkpoint');
    return {
      code: 0,
      result: true,
      error: []
    };

  } catch (error) {
    console.error('[reorder_json] Unexpected error:', error);
    return {
      code: 1,
      result: false,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
