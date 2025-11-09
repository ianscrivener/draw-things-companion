# Project Context - DrawThings Companion

**Last Updated:** 2025-11-04
**Git Branch:** main
**Recent Commit:** 099c4e4 - simplified react app state

---

## Quick Start

### Run the App
```bash
npm run tauri dev    # ALWAYS use this - never npm run dev
```

### Current Git Status
```
D  APP_STARTUP_STEPS.md
M  src/lib/tauri_handlers/app_init.js
M  src/lib/tauri_handlers/rescan_all_models.js
?? APP_INIT_NOTES.md
?? CONTEXT.md (this file)
```

---

## What This Project Is

**DrawThings Companion** - A Tauri v2 desktop app for managing AI models used by the DrawThings macOS app. Allows users to organize models between Mac HD and an external "Stash" drive to save disk space.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), React, Tailwind CSS
- Backend: Tauri v2 (Rust) - minimal pass-through only
- Database: SQLite via `@tauri-apps/plugin-sql`
- File System: `@tauri-apps/plugin-fs`

---

## Critical Architecture Decisions

### 1. Frontend-First Philosophy
**ALL business logic is in JavaScript.** The developer cannot code Rust, so the Rust backend in `src-tauri/src/lib.rs` contains ONLY two trivial commands (`greet()` and `meta()`). Everything else uses Tauri plugins directly from JavaScript.

### 2. Two-Phase Initialization

**app_init()** - Runs on EVERY app launch
- File: `src/lib/tauri_handlers/app_init.js`
- Purpose: Load config, scan models, sync database
- Returns: merged configuration object

**app_first_run()** - Runs ONLY on first launch
- File: `src/lib/tauri_handlers/app_first_run.js`
- Purpose: Create settings.json with `initialized: true`, create database schema
- Triggers: When `settings.json` doesn't exist or `initialized !== true`

### 3. Dual-Location Settings Storage

Settings are stored in TWO places:
1. Primary: `~/.drawthings_companion/settings.json` (DTC_APP_DIR)
2. Backup: `[STASH_DIR]/App_Data/settings.json`

This ensures settings persist even if the external drive is disconnected.

### 4. Database Location

Database is stored in: `[STASH_DIR]/App_Data/drawthings_companion.sqlite`

Stored in STASH_DIR (not DTC_APP_DIR) so data stays with the stashed models.

---

## Key Database Tables

### ckpt_models (Primary Table)
```sql
- filename (PRIMARY KEY) - Unique identifier
- display_name_original - Original name from DrawThings JSON (read-only)
- display_name - User's custom display name (editable, nullable)
- model_type - model, lora, control, clip, text, face_restorer, upscaler, unknown
- exists_mac_hd (BOOLEAN) - Currently on Mac HD
- exists_stash (BOOLEAN) - Currently in Stash
- mac_display_order (INTEGER) - Display position on Mac HD
- lora_strength (INTEGER) - LoRA strength × 10 (e.g., 75 = 7.5)
- file_size, checksum, source_path
- created_at, updated_at
```

### Other Tables
- **ckpt_x_ckpt** - Model relationships (e.g., main model → CLIP/text encoders)
- **config** - App configuration key-value store

---

## Critical Implementation Rules

### Model Scanning Pattern
**ALWAYS consult DrawThings JSON files as source of truth:**

- Main models: `[DT_BASE_DIR]/Models/custom.json`
- LoRAs: `[DT_BASE_DIR]/Models/custom_lora.json`
- ControlNets: `[DT_BASE_DIR]/Models/custom_controlnet.json`

**DO NOT** scan all `.ckpt` files and assume their type. Read the appropriate JSON file first, extract filenames, then import ONLY those files with the correct model type. Use the JSON array position as `mac_display_order`.

### Schema Change Policy
**NEVER make database schema changes without prior approval.**

Required process:
1. Identify need
2. Write rationale
3. Present for approval
4. Wait for explicit approval

### File System Permissions
Allowed paths (configured in `src-tauri/capabilities/default.json`):
- `$HOME/.drawthings_companion/**` (app data)
- `$HOME/Library/Containers/com.liuliu.draw-things/**` (DrawThings - READ ONLY)
- `/Volumes/**` (external drives)

**NEVER save files to DT_BASE_DIR** - it belongs to DrawThings and should be read-only.

---

## State Management

React `useState` hooks (38 state variables across 13 files). No Redux/Zustand.

### Key Hooks

**useAppInitialization** (`src/hooks/useAppInitialization.js`)
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [needsSetup, setNeedsSetup] = useState(false);
const [config, setConfig] = useState(null);
```

**useModels** (`src/hooks/useModels.js`)
```javascript
const [models, setModels] = useState([]);
const [macModels, setMacModels] = useState([]);
const [stashModels, setStashModels] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState(null);
const [pendingChanges, setPendingChanges] = useState([]);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
```

See `APP_STATE.md` for complete documentation.

---

## Tauri Handler Architecture

**Central API:** `src/lib/tauri_handler.js`

All frontend-to-backend communication is centralized here and organized into categories:

- **DATABASE INITIALIZATION:** `init_database`, `rescan_all_models`
- **MODEL MANAGEMENT:** `get_models`, `add_model_to_mac`, `remove_model_from_mac`, `update_models_order`, `scan_mac_models`, `delete_model`
- **APP INITIALIZATION & SETTINGS:** `app_init`, `load_settings`, `save_settings`, `app_first_run`
- **CONFIGURATION:** `get_config_value`, `update_stash_dir`
- **LOGGING:** `get_all_logs`

Each handler is in a separate file under `src/lib/tauri_handlers/`.

---

## Configuration Files

### Environment Variables (.env)
```bash
DT_BASE_DIR=~/Library/Containers/com.liuliu.draw-things/Data/Documents
STASH_DIR=~/DrawThings_Stash
DTC_APP_DIR=~/.drawthings_companion
```

### Settings.json Structure
```json
{
  "DT_BASE_DIR": "~/Library/Containers/com.liuliu.draw-things/Data/Documents",
  "STASH_DIR": "/Volumes/Extreme2Tb/__DrawThings_Stash__",
  "initialized": true,
  "initialized_date": "2025-11-03T03:26:35.064Z"
}
```

**Configuration loading priority:**
1. Load .env (defaults)
2. Load settings.json from DTC_APP_DIR (overrides)
3. Merge and return final config

---

## DO NOT List

1. **DO NOT** write Rust backend logic - only minimal pass-through if absolutely necessary
2. **DO NOT** save to DT_BASE_DIR - it's DrawThings' directory (read-only)
3. **DO NOT** use browser-specific code - app runs in Tauri only
4. **DO NOT** modify .env file - use settings.json for changes
5. **DO NOT** create new backend invoke() calls - use existing Tauri plugins
6. **DO NOT** reference old backend code in `_src-tauri-old/` - it's broken
7. **DO NOT** run `npm run dev` - ALWAYS use `npm run tauri dev`
8. **DO NOT** test the app yourself - Claude Code cannot run Tauri, user must test
9. **DO NOT** change database schema without approval
10. **DO NOT** assume web app compatibility - this is desktop-only

---

## Recent Work

### Last Session Summary
- Created comprehensive `CLAUDE.md` file with project guidance for future Claude Code instances
- Documented frontend-first architecture, two-phase initialization, dual-location settings
- Included critical implementation details (model scanning pattern, database schema, permissions)
- Established development guidelines and constraints

### Recent Commits
```
099c4e4 simplified react app state
42c8dea fix missing files
bde7f38 cleanup, tweaks, split large files
c009f8b split src/lib/tauri_handler.js into smaller files
13576dc add tauri_handler readme
```

---

## Key Documentation Files

- **CLAUDE.md** - Comprehensive guide for Claude Code instances working in this repo
- **APP_INIT_NOTES.md** - Detailed explanation of app_first_run() vs app_init()
- **APP_STATE.md** - Complete catalog of all 38 React state variables across 13 files
- **CLAUDE_NOTES.md** - 547-line comprehensive development context and lessons learned
- **README.md** - User-facing documentation

---

## Common Development Tasks

### Adding a New Feature
1. Implement logic in JavaScript (hooks or components)
2. Use Tauri plugins directly (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-sql`)
3. Add exports to `src/lib/tauri_handler.js` if centralized access is needed
4. Test in Tauri mode: `npm run tauri dev`

### Database Access Pattern
```javascript
import Database from '@tauri-apps/plugin-sql';

const db = await Database.load(`sqlite:${stashDir}/App_Data/drawthings_companion.sqlite`);
const rows = await db.select('SELECT * FROM ckpt_models WHERE model_type = $1', [modelType]);
await db.execute('UPDATE ckpt_models SET display_name = $1 WHERE filename = $2', [name, filename]);
await db.close(); // Always close when done
```

### Error Handling Pattern
```javascript
try {
  console.log('[tauri_handler] operation_name - starting');
  // ... operation ...
  console.log('[tauri_handler] operation_name - completed');
} catch (error) {
  console.error('[tauri_handler] operation_name error:', error);
  // Return safe fallback OR throw
}
```

### Function Naming Conventions
- `app_*` - App-level operations (init, setup, config)
- `get_*` - Read operations
- `save_*` / `load_*` - Persistence operations
- `scan_*` - Import/discovery operations
- `delete_*` / `remove_*` - Destructive operations

---

## Project Structure

```
/
├── src/                              # Next.js frontend
│   ├── app/
│   │   ├── page.js                  # Main app entry
│   │   └── layout.js                # Root layout
│   ├── components/
│   │   ├── views/                   # Main view components
│   │   │   ├── ModelsView.js
│   │   │   ├── LoRAsView.js
│   │   │   ├── ControlNetsView.js
│   │   │   └── SettingsView.js
│   │   ├── TwoPaneManager.jsx       # Mac HD ↔ Stash UI
│   │   ├── SetupWizard.jsx          # First-run setup
│   │   └── LogViewer.js
│   ├── hooks/
│   │   ├── useAppInitialization.js
│   │   └── useModels.js
│   └── lib/
│       ├── tauri_handler.js         # Central API for backend calls
│       └── tauri_handlers/          # Individual handler implementations
├── src-tauri/                        # Rust backend (minimal)
│   ├── src/lib.rs                   # Main Rust file (only meta() and greet())
│   ├── capabilities/default.json    # File system permissions
│   └── tauri.conf.json              # Tauri configuration
├── .env                              # Environment config
├── CLAUDE.md                         # Guide for Claude Code instances
├── APP_INIT_NOTES.md                # Initialization flow documentation
├── APP_STATE.md                     # React state documentation
├── CLAUDE_NOTES.md                  # Detailed development context
└── CONTEXT.md                       # This file - quick reference
```

---

## Next Time You Start

1. Check git status: `git status`
2. Review recent commits: `git log --oneline -5`
3. Read any new/modified files in the status
4. Run the app: `npm run tauri dev`
5. Remember: ALL logic in JavaScript, minimal Rust backend
6. Consult CLAUDE.md for detailed guidance
7. Check APP_STATE.md before adding new state variables
8. Follow model scanning pattern from CLAUDE.md when working with models

---

## Testing Protocol

**CRITICAL:** Claude Code cannot test this app. User must test.

When making changes:
1. Explain what was changed
2. Provide code references (file:line)
3. Suggest specific things for user to test
4. Ask user to run `npm run tauri dev` and report results
5. Wait for feedback before proceeding

---

## Open Questions / Known Issues

*(None currently - add here as they come up)*

---

**End of Context Document**
