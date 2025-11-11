/**
 * get_children - For model ckpts. Returns an array of ckpts filenames that are required by this checkpoint
 *
 * @param {string} ckpt_filename - The checkpoint filename
 * @returns {Object} { code: 0|1, result: [array of ckpt_filenames], error: [] }
 *
 * @notes Returns VAE, clip_encoder, text_encoder etc that are required by this model
 *
 * ERROR CODES:
 * 28 - Record not found
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Finds dependent files (VAE, encoders) that a model requires.
 * - Query in-memory object for the model's full configuration
 * - Parse the model's properties to find referenced child files
 * - Look for fields like: vae, clip_encoder, text_encoder, etc.
 * - Return array of filenames (not full paths)
 * - Used to determine if a file is safe to delete (check if any parents need it)
 */
import { findCkpt, appState } from '../../appState.svelte.js';

export async function get_children(ckpt_filename) {
  console.log(`[get_children] Starting for: ${ckpt_filename}`);

  try {
    // Find the checkpoint in in-memory object
    const ckpt = findCkpt(ckpt_filename);

    if (!ckpt) {
      console.log('[get_children] Checkpoint not found');
      return {
        code: 1,
        result: null,
        error: [{ code: 28, message: 'Record not found', details: `Checkpoint ${ckpt_filename} not found` }]
      };
    }

    // Extract child filenames from checkpoint properties
    // Common DrawThings properties that reference child files:
    // vae, clip_encoder, text_encoder, etc.
    const childFields = ['vae', 'clip_encoder', 'text_encoder', 'refiner', 'upscaler'];
    const children = [];

    for (const field of childFields) {
      if (ckpt[field] && typeof ckpt[field] === 'string') {
        children.push(ckpt[field]);
      }
    }

    console.log(`[get_children] Found ${children.length} child files`);
    return {
      code: 0,
      result: children,
      error: []
    };

  } catch (error) {
    console.error('[get_children] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
