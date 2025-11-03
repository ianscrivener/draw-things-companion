# Tauri Backend API Calls

  | #   | Frontend File                    | Line | Backend Function      | Parameters                           | Purpose/Description                                                                                        |
  |-----|----------------------------------|------|-----------------------|--------------------------------------|------------------------------------------------------------------------------------------------------------|
  | 1   | hooks/useModels.js               | 26   | get_models            | { modelType }                        | Retrieves all models of a specific type (model/lora/controlnet) with their Mac HD status and display order |
  | 2   | hooks/useModels.js               | 129  | add_model_to_mac      | { modelId, displayOrder }            | Adds a model to Mac HD with specified display order                                                        |
  | 3   | hooks/useModels.js               | 134  | remove_model_from_mac | { modelId }                          | Removes a model from Mac HD (keeps in stash)                                                               |
  | 4   | hooks/useModels.js               | 143  | update_models_order   | { updates: [[modelId, order], ...] } | Batch updates display order for all Mac models                                                             |
  | 5   | hooks/useAppInitialization.js    | 24   | get_config_value      | { key: 'STASH_EXISTS' }              | Checks if the stash directory is configured (returns 'true' or undefined)                                  |
  | 6   | hooks/useAppInitialization.js    | 47   | initialize_app        | { dtBaseDir, stashDir }              | First-run setup: creates stash directory and initializes configuration                                     |
  | 7   | hooks/useAppInitialization.js    | 53   | scan_mac_models       | { modelType: 'model' }               | Scans DrawThings directory for models and imports them into database                                       |
  | 8   | hooks/useAppInitialization.js    | 54   | scan_mac_models       | { modelType: 'lora' }                | Scans DrawThings directory for LoRAs and imports them into database                                        |
  | 9   | hooks/useAppInitialization.js    | 55   | scan_mac_models       | { modelType: 'controlnet' }          | Scans DrawThings directory for ControlNets and imports them into database                                  |
  | 10  | components/TwoPaneManager.jsx    | 79   | delete_model          | { modelId, deleteFiles }             | Deletes model from database and optionally from disk                                                       |
  | 11  | components/LogViewer.js          | 26   | get_all_logs          | (none)                               | Retrieves all historical log entries from backend                                                          |
  | 12  | components/views/SettingsView.js | 24   | get_app_paths         | (none)                               | Returns configured paths: { dt_base_dir, stash_dir }                                                       |
  | 13  | components/views/SettingsView.js | 46   | update_stash_dir      | { newStashDir }                      | Updates the stash directory path in configuration                                                          |
  | 14  | lib/tauri.js                     | 291  | plugin:path|resolve   | { directory: 'Home' }                | Gets home directory path (Tauri built-in plugin)                                                           |

### Summary by Category

**Model Management (7 calls)**

  - get_models - Load models with Mac/Stash status
  - add_model_to_mac - Add to Mac HD
  - remove_model_from_mac - Remove from Mac HD
  - update_models_order - Reorder Mac models
  - scan_mac_models - Scan & import models (3x for different types)
  - delete_model - Delete from database/disk

**Configuration (3 calls)**

  - get_config_value - Read config values
  - initialize_app - First-run setup
  - get_app_paths - Get directory paths
  - update_stash_dir - Update stash path

**Logging (1 call)**
  - get_all_logs - Retrieve log history

**Tauri Plugins (1 call)**
  - plugin:path|resolve - Path resolution (built-in)


**Notes**
  1. No current backend exists - All these functions need to be implemented in the new Rust backend (src-tauri/)
  2. Event listeners: The frontend also listens for log-event events (LogViewer.js:32), which the backend would need to emit
  3. Frontend libraries already in use:
    - @tauri-apps/api/core (invoke)
    - @tauri-apps/api/event (listen)
    - @tauri-apps/plugin-dialog (open - file picker)
    - @tauri-apps/plugin-shell (Command)
    - @tauri-apps/plugin-fs (file system ops)
    - @tauri-apps/plugin-sql (SQLite)


The frontend expects these backend functions to handle the application logic, but as you mentioned, you want to move that logic to the frontend and have simple pass-through Tauri APIs for file system access instead.
