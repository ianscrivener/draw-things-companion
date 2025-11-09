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

The Rust backend is ONLY for simple pass-through Tauri API calls. All business logic, database operations, file operations, and state management must be implemented in JavaScript.

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

See [**functions_datasets_app_state.md**](functions_datasets_app_state.md)


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

1. Implement logic in JavaScript (hooks or components)
2. Use Tauri plugins directly (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-sql`)
3. Test in Tauri mode: `npm run tauri dev`


### Error Handling Pattern

```javascript
try {
  console.log('[tauri_handler] operation_name - starting');
  // ... operation ...
  console.log('[tauri_handler] operation_name - completed');
}
catch (error) {
  console.error('[tauri_handler] operation_name error:', error);
  // Return safe fallback OR throw
}
```
<br>

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
10. Assume web app compatibility - this is desktop-only
11. Read documentaiton in `_old_documentation`
12. Reference old code in `__src-deprecated`
13. Reference old code in `__src-deprecated-next.js`

<br>

---

### Application logging for development 

See: [**logging.md**](logging.md)

<br>


---


### Additional Documentation

- [**functions_datasets_app_state.md**](functions_datasets_app_state.md)
- [**logging.md**](logging.md)