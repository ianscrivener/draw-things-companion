/**
 * get_parents - For VAE, clip_encoder, text_encoder etc. Returns an array of parent ckpts filenames
 *
 * @param {string} ckpt_filename - The checkpoint filename
 * @returns {Object} { code: 0|1, result: [array of ckpt_filenames], error: [] }
 *
 * @notes Returns models that use this checkpoint
 *
 * ERROR CODES:
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Finds which models depend on this file (inverse of get_children).
 * - Query in-memory object for all models that reference this filename
 * - Search model configurations for references to ckpt_filename
 * - Return array of parent model filenames
 * - CRITICAL for safety: a file is NOT orphaned if it has parents
 * - Used before deletion to ensure dependent models won't break
 */
import { appState } from '../../appState.svelte.js';

export async function get_parents(ckpt_filename) {
  console.log(`[get_parents] Starting for: ${ckpt_filename}`);

  try {
    const parents = [];

    // Search all models/loras/controls across mac and stash
    const locations = ['mac', 'stash'];
    const types = ['models', 'loras', 'controls'];

    for (const location of locations) {
      for (const type of types) {
        const ckpts = appState[location][type];

        for (const ckpt of ckpts) {
          // Check if this ckpt references our target filename as a child
          const childFields = ['vae', 'clip_encoder', 'text_encoder', 'refiner', 'upscaler'];

          for (const field of childFields) {
            if (ckpt[field] === ckpt_filename) {
              parents.push(ckpt.filename);
              break; // Only add each parent once
            }
          }
        }
      }
    }

    console.log(`[get_parents] Found ${parents.length} parent files`);
    return {
      code: 0,
      result: parents,
      error: []
    };

  } catch (error) {
    console.error('[get_parents] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
