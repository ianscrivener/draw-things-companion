# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DrawThings Companion** is a Tauri v2 desktop application for managing AI models used by the DrawThings macOS app. It allows users to organize models between their Mac HD and an external "Stash" drive to save disk space.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), React, Tailwind CSS
- Backend: Tauri v2 (Rust) - minimal pass-through only
- Database: SQLite via `@tauri-apps/plugin-sql`
- File System: `@tauri-apps/plugin-fs`

## Commands

### Development
```bash
npm run tauri dev        # Run app in development mode (hot-reload enabled)
npm run lint             # Run ESLint
```

### Building
```bash
npm run tauri build      # Create production macOS .app bundle
npm run build            # Build Next.js frontend only
```

### Testing
```bash
# Note: This is a Tauri desktop app - Claude Code cannot test it directly
# All testing must be done manually using `npm run tauri dev`
```

**CRITICAL:** NEVER run `npm run dev` - this app requires Tauri APIs that do not work in browsers. Always use `npm run tauri dev`.

## Architecture & Design Principles

### Frontend-First Architecture

**ALL application logic MUST be in the frontend (JavaScript/React).**

The Rust backend is ONLY for simple pass-through Tauri API calls. The developer cannot code Rust, so all business logic, database operations, file operations, and state management must be implemented in JavaScript.

**Frontend Responsibilities:**
- Business logic (model management, scanning, validation)
- Database queries using `@tauri-apps/plugin-sql`
- File operations using `@tauri-apps/plugin-fs`
- Settings management (read/write settings.json)
- State management (React hooks)
- Error handling and user feedback

**Backend Responsibilities:**
- ONLY: Expose Tauri plugin access to frontend via minimal commands in `src-tauri/src/lib.rs`

### Application State Management

The application uses React `useState` hooks (38 state variables across 13 files). No Redux/Zustand. Key hooks:

- `useAppInitialization` (src/hooks/useAppInitialization.js) - Manages app startup and setup flow
- `useModels` (src/hooks/useModels.js) - Central state for model data and operations

See APP_STATE.md for complete state documentation.

### Initialization Flow

**Two-Phase Startup:**

1. **app_init()** - Runs on EVERY app launch (src/lib/tauri_handlers/app_init.js)
   - Loads config from .env + settings.json
   - Scans DrawThings directory for models/LoRAs/ControlNets
   - Updates database with new/changed models
   - Returns merged configuration

2. **app_first_run()** - Runs ONLY on first launch (src/lib/tauri_handlers/app_first_run.js)
   - Creates settings.json with `initialized: true` flag
   - Saves settings to both DTC_APP_DIR and STASH_DIR/App_Data
   - Creates SQLite database schema
   - Creates necessary directories

If `initialized !== true`, the SetupWizard is shown to collect directory paths from the user.

## Configuration & Settings

### Environment Variables (.env)
```bash
DT_BASE_DIR=~/Library/Containers/com.liuliu.draw-things/Data/Documents
STASH_DIR=~/DrawThings_Stash
DTC_APP_DIR=~/.drawthings_companion
```

### Settings Storage

**TWO copies of settings.json are maintained:**

1. Primary: `~/.drawthings_companion/settings.json` (DTC_APP_DIR)
2. Backup: `/Volumes/Extreme2Tb/__DrawThings_Stash__/App_Data/settings.json`

This ensures settings persist even if the external drive is disconnected.

**Settings.json structure:**
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

## Database

### Schema & Location

**Database:** `[STASH_DIR]/App_Data/drawthings_companion.sqlite`

Database is stored in STASH_DIR (not DTC_APP_DIR) to ensure data persists with the stashed models.

**Main Tables:**

1. **ckpt_models** - Primary table for all model files
   - `filename` (PRIMARY KEY) - Unique identifier
   - `display_name_original` - Original name from DrawThings JSON (read-only)
   - `display_name` - User's custom display name (editable, nullable)
   - `model_type` - Type: model, lora, control, clip, text, face_restorer, upscaler, unknown
   - `file_size`, `checksum`, `source_path`
   - `exists_mac_hd` (BOOLEAN) - Currently on Mac HD
   - `exists_stash` (BOOLEAN) - Currently in Stash
   - `mac_display_order` (INTEGER) - Display position on Mac HD
   - `lora_strength` (INTEGER) - LoRA strength × 10 (e.g., 75 = 7.5)
   - Timestamps: `created_at`, `updated_at`

2. **ckpt_x_ckpt** - Model relationships (e.g., main model → CLIP/text encoders)

3. **config** - App configuration key-value store

### Database Access Pattern

```javascript
import Database from '@tauri-apps/plugin-sql';

const db = await Database.load(`sqlite:${stashDir}/App_Data/drawthings_companion.sqlite`);
const rows = await db.select('SELECT * FROM ckpt_models WHERE model_type = $1', [modelType]);
await db.execute('UPDATE ckpt_models SET display_name = $1 WHERE filename = $2', [name, filename]);
await db.close(); // Always close when done
```

### Schema Change Policy

**CRITICAL:** NEVER make database schema changes without prior approval.

**Required process:**
1. Identify need for schema change
2. Write brief rationale explaining WHY
3. Present proposed change for approval
4. Wait for explicit approval before implementing

## Critical Implementation Details

### Model Scanning & Categorization

When scanning models, ALWAYS consult DrawThings JSON files as the source of truth:

- Main models: `[DT_BASE_DIR]/Models/custom.json`
- LoRAs: `[DT_BASE_DIR]/Models/custom_lora.json`
- ControlNets: `[DT_BASE_DIR]/Models/custom_controlnet.json`

**DO NOT** scan all .ckpt files and assume their type. Read the appropriate JSON file first, extract filenames, then import ONLY those files with the correct model type. Use the JSON array position as `mac_display_order`.

See CLAUDE_NOTES.md section "Critical Bug Fix - Model Type Categorization" for details on why this matters.

### Tauri Handler Architecture

**Central API:** `src/lib/tauri_handler.js`

All frontend-to-backend communication goes through this module, organized into categories:

- DATABASE INITIALIZATION: `init_database`, `rescan_all_models`
- MODEL MANAGEMENT: `get_models`, `add_model_to_mac`, `remove_model_from_mac`, `update_models_order`, `scan_mac_models`, `delete_model`
- APP INITIALIZATION & SETTINGS: `app_init`, `load_settings`, `save_settings`, `app_first_run`
- CONFIGURATION: `get_config_value`, `update_stash_dir`
- LOGGING: `get_all_logs`

Each handler is in a separate file under `src/lib/tauri_handlers/`.

### File System Permissions

Configured in `src-tauri/capabilities/default.json`:

**Allowed paths:**
- `$HOME/.drawthings_companion/**` (app data)
- `$HOME/Library/Containers/com.liuliu.draw-things/**` (DrawThings - READ ONLY)
- `/Volumes/**` (external drives for stash)
- `.env` files for config

**NEVER save files to DT_BASE_DIR** - it belongs to DrawThings and should be read-only.

## Key File Locations

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
│   ├── src/lib.rs                   # Main Rust file (only meta() and greet() commands)
│   ├── capabilities/default.json    # File system permissions
│   └── tauri.conf.json              # Tauri configuration
├── .env                              # Environment config
├── APP_INIT_NOTES.md                # Initialization flow documentation
├── APP_STATE.md                     # React state documentation
└── CLAUDE_NOTES.md                  # Detailed development context
```

## Development Guidelines

### When Adding Features

1. Implement logic in JavaScript (hooks or components)
2. Use Tauri plugins directly (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-sql`)
3. Add exports to `src/lib/tauri_handler.js` if centralized access is needed
4. Test in Tauri mode: `npm run tauri dev`

### Function Naming Conventions

- `app_*` - App-level operations (init, setup, config)
- `get_*` - Read operations
- `save_*` / `load_*` - Persistence operations
- `scan_*` - Import/discovery operations
- `delete_*` / `remove_*` - Destructive operations

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

## Critical Constraints

**DO NOT:**
1. Write Rust backend logic - only minimal pass-through if absolutely necessary
2. Save to DT_BASE_DIR - it's DrawThings' directory (read-only)
3. Use browser-specific code - app runs in Tauri only
4. Modify .env file - use settings.json for changes
5. Create new backend invoke() calls - use existing Tauri plugins
6. Reference old backend code in `_src-tauri-old/` - it's broken
7. Run `npm run dev` - ALWAYS use `npm run tauri dev`
8. Test the app yourself - Claude Code cannot run Tauri, user must test
9. Change database schema without approval
10. Assume web app compatibility - this is desktop-only

## Additional Documentation

- **APP_INIT_NOTES.md** - Detailed initialization flow
- **APP_STATE.md** - Complete React state catalog
- **CLAUDE_NOTES.md** - Comprehensive development context and lessons learned
- **README.md** - User-facing documentation
