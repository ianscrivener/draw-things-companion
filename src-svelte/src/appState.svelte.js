/**
 * appState.svelte.js - Global application state using Svelte 5 $state rune
 *
 * This replaces the previous SQLite database with an in-memory JavaScript object.
 * All checkpoint data, settings, and application state are stored here.
 *
 * Structure mirrors the previous database schema from create_db.sql:
 * - mac/stash arrays contain full model objects with all metadata
 * - ckpts arrays contain raw filesystem listings
 * - settings object contains application configuration
 */

// Initialize the global state using Svelte 5 $state rune
export const appState = $state({
	// Organized models/loras/controls from DrawThings JSON files
	// Each object contains all fields from ckpt_models SQL table:
	// filename, display_name_original, display_name, model_type, file_size,
	// checksum, source_path, exists_mac_hd, exists_stash, mac_display_order,
	// lora_strength, created_at, updated_at
	mac: {
		models: [],    // Models found in Mac HD DrawThings JSON
		loras: [],     // LoRAs found in Mac HD DrawThings JSON
		controls: []   // ControlNets found in Mac HD DrawThings JSON
	},
	stash: {
		models: [],    // Models found in Stash DrawThings JSON
		loras: [],     // LoRAs found in Stash DrawThings JSON
		controls: []   // ControlNets found in Stash DrawThings JSON
	},

	// Raw filesystem checkpoint listings (used for sync/comparison)
	// Each object: {ckpt_filename, file_size, file_date}
	ckpts: {
		mac: [],       // All .ckpt files found on Mac HD
		stash: []      // All .ckpt files found in Stash
	},

	// Trash/deleted items from Stash
	stash_trash: {
		models: [],
		loras: [],
		controls: []
	},

	// Application settings (merged from .env and settings.json)
	settings: {
		DT_BASE_DIR: '',
		STASH_DIR: '',
		DTC_APP_DIR: '',
		initialized: false,
		initialized_date: null
	}
});

/**
 * Helper function to find a checkpoint across all locations
 * @param {string} filename - The checkpoint filename to find
 * @returns {Object|null} - The checkpoint object or null if not found
 */
export function findCkpt(filename) {
	const locations = [
		...appState.mac.models,
		...appState.mac.loras,
		...appState.mac.controls,
		...appState.stash.models,
		...appState.stash.loras,
		...appState.stash.controls
	];
	return locations.find(ckpt => ckpt.filename === filename) || null;
}

/**
 * Helper function to get all checkpoints of a specific type and location
 * @param {string} location - 'mac' or 'stash'
 * @param {string} type - 'model', 'lora', or 'control'
 * @returns {Array} - Array of checkpoint objects
 */
export function getCkptsByTypeAndLocation(location, type) {
	const typeMap = {
		model: 'models',
		lora: 'loras',
		control: 'controls'
	};
	const key = typeMap[type];
	return appState[location]?.[key] || [];
}

/**
 * Helper function to add or update a checkpoint in the state
 * @param {string} location - 'mac' or 'stash'
 * @param {string} type - 'model', 'lora', or 'control'
 * @param {Object} ckptData - The checkpoint object to add/update
 */
export function upsertCkpt(location, type, ckptData) {
	const typeMap = {
		model: 'models',
		lora: 'loras',
		control: 'controls'
	};
	const key = typeMap[type];
	const array = appState[location][key];
	const index = array.findIndex(ckpt => ckpt.filename === ckptData.filename);

	if (index >= 0) {
		// Update existing
		array[index] = { ...array[index], ...ckptData, updated_at: new Date().toISOString() };
	} else {
		// Add new
		array.push({
			...ckptData,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});
	}
}

/**
 * Helper function to remove a checkpoint from the state
 * @param {string} location - 'mac' or 'stash'
 * @param {string} type - 'model', 'lora', or 'control'
 * @param {string} filename - The checkpoint filename to remove
 */
export function removeCkpt(location, type, filename) {
	const typeMap = {
		model: 'models',
		lora: 'loras',
		control: 'controls'
	};
	const key = typeMap[type];
	const array = appState[location][key];
	const index = array.findIndex(ckpt => ckpt.filename === filename);
	if (index >= 0) {
		array.splice(index, 1);
	}
}
