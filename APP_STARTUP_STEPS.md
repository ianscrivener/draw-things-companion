# App Startup Steps

**DrawThings Companion - Application Initialization Flow**

---

## 🚀 First Start (Initial Setup)

### User Experience:
1. User launches app for first time
2. App shows **SetupWizard** modal
3. User enters:
   - DrawThings directory (default: `~/Library/Containers/com.liuliu.draw-things/Data/Documents`)
   - Stash directory (e.g., `/Volumes/Extreme2Tb/__DrawThings_Stash__`)
4. User clicks "Start Setup"
5. App performs initialization (see Technical Flow below)
6. SetupWizard closes
7. Main app UI loads with models displayed

### Technical Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. App Launches                                                 │
│    └─> useAppInitialization.checkInitialization()               │
│        └─> app_init()                                           │
│            ├─> Load .env file (if exists)                       │
│            ├─> Load settings.json (if exists)                   │
│            └─> Returns: { initialized: false }                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Show SetupWizard (needsSetup = true)                        │
│    └─> User enters directories                                 │
│    └─> User clicks "Start Setup"                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Initialize App                                               │
│    └─> useAppInitialization.initializeApp(dtBaseDir, stashDir) │
│        └─> app_first_run(dtBaseDir, stashDir)                  │
│            ├─> save_settings()                                  │
│            │   ├─> Save to ~/.drawthings_companion/settings.json│
│            │   └─> Save to [STASH_DIR]/App_Data/settings.json  │
│            └─> init_database(stashDir)                          │
│                ├─> Create App_Data directory                    │
│                ├─> Create database file                         │
│                └─> Create tables (ckpt_models, ckpt_x_ckpt, config)│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Scan & Import Models                                         │
│    └─> scan_mac_models('model')                                │
│    └─> scan_mac_models('lora')                                 │
│    └─> scan_mac_models('control')  ← Note: 'control' not 'controlnet'│
│        └─> For each model type:                                │
│            ├─> Read DrawThings JSON file FIRST:                │
│            │   ├─> 'model' → custom.json                       │
│            │   ├─> 'lora' → custom_lora.json                   │
│            │   └─> 'control' → custom_controlnet.json          │
│            ├─> Extract filenames from JSON entries             │
│            │   (ONLY files listed in JSON belong to this type) │
│            ├─> For each file in JSON:                          │
│            │   ├─> Check if already in database (skip if yes)  │
│            │   ├─> Extract metadata from JSON entry:           │
│            │   │   ├─> display_name_original (entry.name)      │
│            │   │   └─> lora_strength (entry.strength × 10)     │
│            │   ├─> Get file size (via Tauri metadata)          │
│            │   ├─> Use array position as mac_display_order     │
│            │   └─> Insert into database:                       │
│            │       ├─> filename (primary key)                  │
│            │       ├─> display_name_original (from JSON)       │
│            │       ├─> model_type (from parameter)             │
│            │       ├─> file_size (from metadata)               │
│            │       ├─> source_path (full path)                 │
│            │       ├─> exists_mac_hd = true                    │
│            │       ├─> exists_stash = false (initially)        │
│            │       ├─> mac_display_order (array index)         │
│            │       └─> lora_strength (if LoRA)                 │
│            └─> Return scan results (found, imported, skipped)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Main App UI Loads                                            │
│    └─> SetupWizard closes                                      │
│    └─> Main views load models from database                    │
│    └─> User sees their models in ModelsView, LoRAsView, etc.  │
└─────────────────────────────────────────────────────────────────┘
```

### Files Created:
- `~/.drawthings_companion/settings.json`
- `[STASH_DIR]/App_Data/settings.json`
- `[STASH_DIR]/App_Data/drawthings_companion.sqlite`

### Settings.json Structure:
```json
{
  "DT_BASE_DIR": "~/Library/Containers/com.liuliu.draw-things/Data/Documents",
  "STASH_DIR": "/Volumes/Extreme2Tb/__DrawThings_Stash__",
  "initialized": true,
  "initialized_date": "2025-11-03T15:30:00.000Z"
}
```

---

## 🔄 Restart (Subsequent Launches)

### User Experience:
1. User launches app
2. App loads directly to main UI (no SetupWizard)
3. Models are displayed immediately from database

### Technical Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. App Launches                                                 │
│    └─> useAppInitialization.checkInitialization()               │
│        └─> app_init()                                           │
│            ├─> Load .env file                                   │
│            ├─> Load settings.json from:                         │
│            │   └─> ~/.drawthings_companion/settings.json        │
│            ├─> Merge configurations                             │
│            └─> Returns: { initialized: true, ... }              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Main App UI Loads Immediately                                │
│    └─> SetupWizard is skipped (initialized = true)             │
│    └─> Views load models via get_models()                      │
│        └─> Queries database for each model type                │
│        └─> Displays models in UI                               │
└─────────────────────────────────────────────────────────────────┘
```

### No Data Import on Restart:
- Models are already in database from first run
- App just reads existing data
- Database is NOT repopulated on every start

---

## 📊 Key Functions

### Initialization Functions (in `src/lib/tauri_handler.js`)

#### `app_init()`
- **When:** Every app launch
- **Purpose:** Load configuration and ensure database exists
- **Returns:** Configuration object with `initialized` flag

#### `app_first_run(dtBaseDir, stashDir)`
- **When:** First run only (via SetupWizard)
- **Purpose:** Create settings files and initialize database
- **Calls:**
  - `save_settings()`
  - `init_database()`

#### `init_database(stashDir)`
- **When:** First run + every launch (idempotent)
- **Purpose:** Create database and tables if they don't exist
- **Safe to call multiple times:** Uses `CREATE TABLE IF NOT EXISTS`

#### `scan_mac_models(modelType)`
- **When:** First run only (after database creation)
- **Purpose:** Scan DrawThings directory and populate database
- **Parameters:** `'model'`, `'lora'`, or `'control'` (NOT 'controlnet')
- **How it works:**
  1. Reads the appropriate JSON file (custom.json, custom_lora.json, or custom_controlnet.json)
  2. Extracts filenames from JSON entries - these are the ONLY files for this type
  3. Imports only those files with correct model_type
  4. Uses JSON array position as mac_display_order
- **Returns:** Scan results object:
  ```javascript
  {
    found: 15,      // Number of files found in JSON
    imported: 15,   // Number successfully imported
    skipped: 0,     // Number already in database
    errors: []      // Array of any errors
  }
  ```

#### `get_models(modelType)`
- **When:** Every time a view loads
- **Purpose:** Retrieve models from database
- **Returns:** Array of model objects

---

## 🔍 DrawThings File Locations

### Configuration Files (Read during scan):
```
~/Library/Containers/com.liuliu.draw-things/Data/Documents/Models/
├── custom.json              # Main models metadata & display order
├── custom_lora.json         # LoRA models metadata & display order
└── custom_controlnet.json   # ControlNet models metadata & display order
```

### Model Files:
```
~/Library/Containers/com.liuliu.draw-things/Data/Documents/Models/
├── model1.ckpt
├── model2.ckpt
└── ... (all .ckpt files)
```

---

## ⚠️ Important Notes

1. **Database Location:** `[STASH_DIR]/App_Data/drawthings_companion.sqlite`
   - Stored in Stash to keep data with models
   - If Stash drive is disconnected, app cannot access database

2. **Settings Redundancy:** Two copies of settings.json
   - Primary: `~/.drawthings_companion/settings.json`
   - Backup: `[STASH_DIR]/App_Data/settings.json`
   - If Stash is disconnected, app can still read from DTC_APP_DIR

3. **Model Scanning:** Only happens on first run
   - NOT re-scanned on every restart
   - User must manually trigger re-scan if needed (future feature)

4. **Database Schema:** See `_documentation/data_schema/create_db.sql`

5. **Frontend-First:** All logic is in JavaScript
   - No Rust backend logic
   - Uses Tauri plugins directly (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-sql`)

---

## 🐛 Troubleshooting

### "No such table: ckpt_models"
- **Cause:** Database not initialized
- **Check:** Does `[STASH_DIR]/App_Data/drawthings_companion.sqlite` exist?
- **Fix:** Delete database and restart app (will be recreated)

### "sql.load not allowed. Plugin not found"
- **Cause:** SQLite plugin not installed
- **Check:**
  - `src-tauri/Cargo.toml` has `tauri-plugin-sql = { version = "2", features = ["sqlite"] }`
  - `src-tauri/src/lib.rs` has `.plugin(tauri_plugin_sql::Builder::default().build())`
  - `src-tauri/capabilities/default.json` has SQL permissions
- **Fix:** Rebuild Tauri app with `npm run tauri build`

### "forbidden path: ~/Library/Containers/..."
- **Cause:** Missing Tauri file system permissions or tilde not expanded
- **Check:**
  - `src-tauri/capabilities/default.json` has `fs:allow-read-dir` and `fs:allow-stat` permissions
  - Path includes `$HOME/Library/Containers/com.liuliu.draw-things/**`
  - `app_init()` expands tilde (~) to full home directory path
- **Fix:** Add missing permissions and rebuild

### SetupWizard shows every time
- **Cause:** Settings not saved or initialized flag missing
- **Check:**
  - `~/.drawthings_companion/settings.json` exists
  - `settings.json` has `"initialized": true`
- **Fix:** Delete settings and run setup again

### All models showing as 'model' type (LoRAs and ControlNets not categorized)
- **Cause:** Old bug where scan_mac_models didn't consult JSON files
- **Status:** ✅ FIXED - Now reads JSON files first to properly categorize
- **How to fix if you have old database:** Delete database and re-run first setup

### "Unknown model type: controlnet"
- **Cause:** Using 'controlnet' instead of 'control' as parameter
- **Fix:** Use `scan_mac_models('control')` not `scan_mac_models('controlnet')`

---

**Last Updated:** 2025-11-03 (End of Day)

**Current Status:** ✅ All major features working correctly - models displaying by type from database!
