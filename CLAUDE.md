# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<br>

## Project Overview

**DrawThings Companion** is a Tauri v2 desktop application for managing AI models used by the DrawThings macOS app. It allows users to organize models between their Mac HD and an external "Stash" drive to save disk space on the Mac HD.

**Tech Stack:**
- Frontend: Svelte v5
- Frontend build: Vite v7
- Vanilla CSS
- Icons: Lucide via lucide-svelte
- Javascript ESM (no Typescript) 
- Backend: Tauri v2 (Rust) - minimal pass-through only
- Target OS: MacOS only, recent version with M-series silicon only (ARM64)
- Target device: Desktop only

## Commands

### Development
```bash
npm run tauri dev        # Run app in development mode (hot-reload enabled)
```

### Building
```bash
npm run tauri build      # Create production macOS .app bundle
npm run build            # Build Svelte frontend only
```

### Testing
```bash
# Note: This is a Tauri desktop app - Claude Code cannot test it directly
# All testing must be done manually using `npm run tauri dev`
```

**CRITICAL:** NEVER run `npm run dev` - this app requires Tauri APIs that do not work in browsers. Always use `npm run tauri dev`.

---


<br>



## Architecture & Design Principles

### Frontend-First Architecture

**ALL application logic MUST be in the frontend (JavaScript/Svelte).**

The Rust backend is ONLY for simple pass-through Tauri API calls. All business logic, state management, file operations, and data storage must be implemented in JavaScript.

**Frontend Responsibilities:**
- Business logic (model management, scanning, validation)
- In-memory data storage using Svelte 5 `$state` rune (NO database)
- File operations using `@tauri-apps/plugin-fs`
- Settings management (read/write settings.json)
- State management (Svelte 5 $state rune)
- Error handling and user feedback

**Backend Responsibilities:**
- ONLY: Expose Tauri plugin access to frontend via minimal commands in `src-tauri/src/lib.rs`

### Application State Management

**In-Memory Object Storage:**

This application uses an **in-memory JavaScript object** instead of a database. All checkpoint data, settings, and application state are stored in a global Svelte 5 `$state` object.

- **Location:** `src-svelte/src/appState.svelte.js`
- **Storage:** All data in RAM, no database
- **Reactivity:** Svelte 5 `$state` rune provides automatic UI updates
- **Persistence:** Data loaded from DrawThings JSON files on startup

See [**MEMORY_OBJECT.md**](MEMORY_OBJECT.md) for complete documentation on the in-memory object structure and usage.

See [**functions_datasets_app_state.md**](functions_datasets_app_state.md) for function reference.


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

<br>


---

## Critical Implementation Details

### Model Scanning & Categorization

When scanning models, ALWAYS consult DrawThings JSON files as the source of truth:

- Main models: `[DT_BASE_DIR]/Models/custom.json`
- LoRAs: `[DT_BASE_DIR]/Models/custom_lora.json`
- ControlNets: `[DT_BASE_DIR]/Models/custom_controlnet.json`

**DO NOT** scan all .ckpt files and assume their type. Read the appropriate JSON file first, extract filenames, then import ONLY those files with the correct model type. Use the JSON array position as `mac_display_order`.

See CLAUDE_NOTES.md section "Critical Bug Fix - Model Type Categorization" for details on why this matters.


### File System Permissions

**Allowed paths:**
- `$HOME/.drawthings_companion/**` (app data)
- `$HOME/Library/Containers/com.liuliu.draw-things/**` (DrawThings - READ ONLY)
- `/Volumes/**` (external drives for stash)
- `.env` files for config

**NEVER save files to DT_BASE_DIR** - it belongs to DrawThings and should be read-only.

---

<br>



## Development Guidelines

### When Adding Features

1. Implement logic in JavaScript (Svelte components or library functions)
2. Use Tauri plugins directly (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-shell`, `@tauri-apps/plugin-http`)
3. Directly mutate the `appState` object - Svelte automatically handles reactivity
4. Use helper functions from `appState.svelte.js` (findCkpt, upsertCkpt, removeCkpt, etc.)
5. Test in Tauri mode: `npm run tauri dev`


### Error Handling Pattern

All library functions follow a consistent return structure:

```javascript
// Success
return {
  code: 0,
  result: data,
  error: []
};

// Failure
return {
  code: 1,
  result: null,
  error: [{ code: 42, message: 'Error message', details: 'Additional context' }]
};
```

**Logging pattern:**
```javascript
try {
  console.log('[function_name] Starting');
  // ... operation ...
  console.log('[function_name] Completed successfully');
  return { code: 0, result: data, error: [] };
}
catch (error) {
  console.error('[function_name] Unexpected error:', error);
  return {
    code: 1,
    result: null,
    error: [{ code: 100, message: 'Unknown error', details: error.message }]
  };
}
```

See [**error_codes.md**](error_codes.md) for complete error code reference.
<br>

## Critical Constraints

**DO NOT:**
1. Write Rust backend logic - only minimal pass-through if absolutely necessary
2. Use `@tauri-apps/plugin-sql` - we use in-memory storage, NOT a database
3. Create database schemas, migrations, or SQL queries
4. Save to DT_BASE_DIR - it's DrawThings' directory (read-only for us)
5. Use browser-specific code - app runs in Tauri only
6. Modify .env file - use settings.json for changes
7. Create new backend invoke() calls - use existing Tauri plugins
8. Reference old backend code in `_src-tauri-old/` - it's broken
9. Run `npm run dev` - ALWAYS use `npm run tauri dev`
10. Test the app yourself - Claude Code cannot run Tauri, user must test
11. Assume web app compatibility - this is desktop-only
12. Read documentation in `_old_documentation`
13. Reference old code in `__src-deprecated`
14. Reference old code in `__src-deprecated-next.js`
15. Reference database-related code in `_old_documentation/data_schema/`

<br>

---

### Application logging for development 

See: [**logging.md**](logging.md)

<br>


---


### Additional Documentation

- [**MEMORY_OBJECT.md**](MEMORY_OBJECT.md) - In-memory object structure and Svelte $state usage
- [**functions_datasets_app_state.md**](functions_datasets_app_state.md) - Function reference
- [**error_codes.md**](error_codes.md) - Error code reference
- [**logging.md**](logging.md) - Logging conventions