// DATABASE INITIALIZATION
export { rescan_all_models } from './tauri_handlers/rescan_all_models.js';
export { init_database } from './tauri_handlers/init_database.js';

// MODEL MANAGEMENT
export { get_models } from './tauri_handlers/get_models.js';
export { add_model_to_mac } from './tauri_handlers/add_model_to_mac.js';
export { remove_model_from_mac } from './tauri_handlers/remove_model_from_mac.js';
export { update_models_order } from './tauri_handlers/update_models_order.js';
export { scan_mac_models } from './tauri_handlers/scan_mac_models.js';
export { delete_model } from './tauri_handlers/delete_model.js';

// APP INITIALIZATION & SETTINGS MANAGEMENT
export { app_init } from './tauri_handlers/app_init.js';
export { load_settings } from './tauri_handlers/load_settings.js';
export { save_settings } from './tauri_handlers/save_settings.js';

// CONFIGURATION
export { get_config_value } from './tauri_handlers/get_config_value.js';
export { app_first_run } from './tauri_handlers/app_first_run.js';
export { update_stash_dir } from './tauri_handlers/update_stash_dir.js';

// LOGGING
export { get_all_logs } from './tauri_handlers/get_all_logs.js';

// Re-export common Tauri APIs that might be needed
export { invoke } from '@tauri-apps/api/core';
export { listen, emit } from '@tauri-apps/api/event';
export { open } from '@tauri-apps/plugin-dialog';
