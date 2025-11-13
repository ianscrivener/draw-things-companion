/**
 * get_type - Returns the type of the input checkpoint
 *
 * @param {string} ckpt_filename - The checkpoint filename
 * @returns {Object} { code: 0|1, result: [type_string], error: [] }
 *
 * @notes Returns: model, lora, control, VAE, clip_encoder, text_encoder
 * @notes Checks Mac JSON, Stash JSON & Parquet datasets
 *
 * ERROR CODES:
 * 29 - Model type unknown
 * 38 - JSON file not found
 * 39 - JSON parse error
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Determines checkpoint type - CRITICAL for proper categorization.
 * - First check in-memory object (fastest if already imported)
 * - Then check DrawThings JSON files (custom.json, custom_lora.json, custom_controlnet.json)
 * - If found in custom.json → type='model', custom_lora.json → 'lora', etc.
 * - For component files (VAE, encoders): check if referenced as child in any model
 * - Optionally check parquet datasets as fallback
 * - DO NOT guess from filename - use authoritative sources only
 */
import { findCkpt } from '../../appState.svelte.js';
import { read_json } from './read_json.js';

export async function get_type(ckpt_filename) {
  console.log(`[get_type 1] Starting for: ${ckpt_filename}`);

  try {
    // First, check in-memory object (fastest)
    const ckpt = findCkpt(ckpt_filename);

    if (ckpt && ckpt.model_type) {
      console.log(`[get_type 2] ${ckpt_filename} - Found in memory: ${ckpt.model_type}`);
      return {
        code: 0,
        result: ckpt.model_type,
        error: []
      };
    }

    // Not in memory, check DrawThings JSON files
    const locations = ['mac', 'stash'];
    const types = ['model', 'lora', 'control'];

    for (const location of locations) {
      for (const type of types) {
        const jsonResult = await read_json(location, type);

        if (jsonResult.code === 0 && jsonResult.result) {

          // Search for the filename in this JSON array
          const found = jsonResult.result.find(item =>
            item.file === ckpt_filename || item.filename === ckpt_filename
          );

          if (found) {
            console.log(`[get_type 3] ${ckpt_filename} - Found in ${location} ${type} JSON`);
            return {
              code: 0,
              result: type,
              error: []
            };
          }
        }
      }
    }

    // Not found in any JSON files
    console.log(`[get_type 4] ${ckpt_filename} - Type unknown`);
    return {
      code: 0,
      result: "unknown",
      error: [{ code: 29, message: 'Model type unknown', details: `Checkpoint ${ckpt_filename} not found in any JSON files` }]
    };

  }
  catch (error) {
    console.error(`[get_type 5] ${ckpt_filename} - Unexpected error:`, error);
    return {
      code: 0,
      result: "unknown",
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
