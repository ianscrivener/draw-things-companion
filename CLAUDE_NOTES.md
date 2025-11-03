# DrawThings Companion - Development Notes

**Project Context for Claude Code Sessions**

---

## 📋 Project Overview

**DrawThings Companion** is a Tauri desktop application for managing AI models used by the DrawThings app on macOS. It allows users to organize models between their Mac HD and an external "Stash" drive to save disk space.

### Key Technologies
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Tauri v2 (Rust) - minimal, pass-through only
- **Database:** SQLite (via `@tauri-apps/plugin-sql`)
- **File System:** Tauri FS plugin (`@tauri-apps/plugin-fs`)

---

## 🏗️ Architecture Principles

### **CRITICAL: Application Logic Location**

⚠️ **ALL application logic MUST be in the frontend (JavaScript/React)**
⚠️ **Rust backend is ONLY for simple pass-through Tauri API calls**

**Why?** The developer (Ian) cannot code Rust. The previous backend was full of logic errors and didn't work. We are rebuilding from scratch with frontend-first architecture.

### Frontend Responsibilities
- ✅ Business logic (model management, scanning, validation)
- ✅ Database queries (using Tauri SQL plugin)
- ✅ File operations (using Tauri FS plugin)
- ✅ Settings management (read/write settings.json)
- ✅ State management (React hooks)
- ✅ Error handling and user feedback

### Backend Responsibilities
- ❌ NO business logic
- ❌ NO database operations
- ❌ NO file path manipulation
- ✅ ONLY: Provide Tauri plugin access to frontend

---

## 📁 Directory Structure

### Key Directories

```
/Users/ianscrivener/_⭐️Code_2025_M4/draw-things-companion/
├── src/                          # Next.js frontend
│   ├── app/
│   │   ├── page.js              # Main app entry (uses SetupWizard + views)
│   │   └── layout.js            # Root layout
│   ├── components/
│   │   ├── views/               # Main view components
│   │   │   ├── ModelsView.js
│   │   │   ├── LoRAsView.js
│   │   │   ├── ControlNetsView.js
│   │   │   └── SettingsView.js
│   │   ├── TwoPaneManager.jsx   # Mac HD ↔ Stash UI
│   │   ├── SetupWizard.jsx      # First-run setup
│   │   └── LogViewer.js
│   ├── hooks/
│   │   ├── useAppInitialization.js
│   │   └── useModels.js
│   └── lib/
│       ├── tauri_handler.js     # ⭐ CENTRAL API - All backend calls
│       └── tauri.js             # Tauri helper utilities
├── src-tauri/                    # Rust backend (minimal)
│   ├── src/
│   │   └── lib.rs               # Main Rust file (should be minimal)
│   ├── capabilities/
│   │   └── default.json         # Tauri v2 file system permissions
│   └── tauri.conf.json          # Tauri configuration
├── .env                          # Environment config (NOT for secrets)
├── _src-tauri-old/               # OLD backend for reference ONLY
└── CLAUDE_TODO.md                # Task list for Claude
```

### Important Paths (from .env)

```bash
DT_BASE_DIR=~/Library/Containers/com.liuliu.draw-things/Data/Documents
STASH_DIR=/Volumes/Extreme2Tb/__DrawThings_Stash__
DTC_APP_DIR=~/.drawthings_companion
```

---

## ⚙️ Configuration & Settings

### Settings Storage Strategy

**TWO copies of settings.json are saved:**

1. **Primary:** `~/.drawthings_companion/settings.json` (DTC_APP_DIR)
2. **Backup:** `/Volumes/Extreme2Tb/__DrawThings_Stash__/App_Data/settings.json`

**Why two copies?**
- If external drive is disconnected, app can still read settings from DTC_APP_DIR
- Backup ensures settings aren't lost if local app data is deleted

### Settings.json Structure

```json
{
  "DT_BASE_DIR": "~/Library/Containers/com.liuliu.draw-things/Data/Documents",
  "STASH_DIR": "/Volumes/Extreme2Tb/__DrawThings_Stash__",
  "initialized": true,
  "initialized_date": "2025-11-03T03:26:35.064Z"
}
```

### Configuration Loading Priority

```
1. Load .env file (defaults)
2. Load settings.json from DTC_APP_DIR (overrides .env)
3. Merge configurations
4. Return final config
```

**Function:** `app_init()` in `tauri_handler.js`

---

## 🔐 Tauri Permissions

### File System Access

Configured in `src-tauri/capabilities/default.json`:

**Allowed Paths:**
- `$HOME/.drawthings_companion/**` - App data directory
- `$HOME/Library/Containers/com.liuliu.draw-things/**` - DrawThings app
- `/Volumes/**` - External drives (for stash)
- `.env`, `../.env`, `../../.env`, `../../../.env` - Config files

**Permissions:**
- `fs:allow-read-text-file`
- `fs:allow-write-text-file`
- `fs:allow-mkdir`
- `fs:allow-exists`
- `fs:allow-read-dir`
- `core:path:default`
- `opener:default`

⚠️ **NEVER save files to `DT_BASE_DIR`** - read-only access only!

---

## 🔄 Application Flow

### First Run

```
1. User launches app
2. useAppInitialization hook runs
3. Calls app_init() → tries to load settings.json
4. If initialized !== true → shows SetupWizard
5. User enters directories → clicks "Start Setup"
6. Calls app_first_run(dtBaseDir, stashDir)
7. Creates settings.json in both locations
8. Scans models (future implementation)
9. Sets initialized: true
10. App reloads → shows main UI
```

### Subsequent Runs

```
1. User launches app
2. app_init() loads settings.json
3. initialized === true → shows main UI
4. User interacts with models
```

---

## 📦 Key Functions in `tauri_handler.js`

### App Initialization
- `app_init()` - Load config from .env + settings.json
- `app_first_run(dtBaseDir, stashDir)` - First-run setup
- `save_settings(settings)` - Save to both locations
- `load_settings()` - Load from DTC_APP_DIR

### Model Management (TO BE IMPLEMENTED)
- `get_models(modelType)` - Get all models with Mac/Stash status
- `add_model_to_mac(modelId, displayOrder)` - Add to Mac HD
- `remove_model_from_mac(modelId)` - Remove from Mac HD
- `update_models_order(updates)` - Update display order
- `scan_mac_models(modelType)` - Scan & import models
- `delete_model(modelId, deleteFiles)` - Delete model

### Logging (TO BE IMPLEMENTED)
- `get_all_logs()` - Retrieve log history

---

## 🎨 UI/UX Patterns

### Two-Pane Model Manager

**Left Pane:** Mac HD (models currently on Mac)
- Drag & drop reordering
- Numbered list (display order)
- Remove button (moves to stash conceptually)

**Right Pane:** Stash (models in backup storage)
- Click to add to Mac
- Shows "On Mac" badge if already on Mac
- Delete button (removes from database + optionally files)

### Color Scheme
- Primary brand: `#ff5f57` (red/coral)
- Grays: `#f5f5f5`, `#e0e0e0`, `#666`
- Success: Green
- Error: Red
- Info: Blue

---

## 🚫 What NOT to Do

1. **DO NOT write Rust backend logic** - only minimal pass-through if absolutely necessary
2. **DO NOT save to DT_BASE_DIR** - that's DrawThings' directory (read-only)
3. **DO NOT use browser-specific code** - app runs in Tauri only, not browser
4. **DO NOT modify .env file** - read-only config, use settings.json for changes
5. **DO NOT create new backend invoke() calls** - use existing Tauri plugins directly
6. **DO NOT trust old backend code in `_src-tauri-old/`** - it's broken, reference only

---

## ✅ Development Guidelines

### When Adding New Features

1. **Implement logic in JavaScript first** - in hooks or components
2. **Use Tauri plugins directly** - `@tauri-apps/plugin-fs`, `@tauri-apps/plugin-sql`
3. **Add to tauri_handler.js** - if it needs centralized access
4. **Update CLAUDE_TODO.md** - track progress
5. **Test in Tauri mode** - `npm run tauri dev` (NOT `npm run dev`)

### Function Naming Conventions

- `app_*` - App-level operations (init, setup, config)
- `get_*` - Read operations
- `save_*` / `load_*` - Persistence operations
- `scan_*` - Import/discovery operations
- `delete_*` / `remove_*` - Destructive operations

### Error Handling

```javascript
try {
  // Operation
  console.log('[tauri_handler] operation_name - starting');
  // ... do work ...
  console.log('[tauri_handler] operation_name - completed');
} catch (error) {
  console.error('[tauri_handler] operation_name error:', error);
  // Return safe fallback OR throw
}
```

---

## 🔧 Running the App

### Development
```bash
npm run tauri dev
```
- Launches Tauri window with Next.js hot-reload
- Uses development .env file
- Console logs visible in terminal + DevTools

### Production Build
```bash
npm run tauri build
```
- Creates macOS .app bundle
- Optimized Next.js production build

### DO NOT USE
```bash
npm run dev  # Browser mode - Tauri APIs won't work!
```

---

## 📚 Reference Materials

- **Tauri Docs:** https://v2.tauri.app/
- **Next.js 14 Docs:** https://nextjs.org/docs
- **Tauri FS Plugin:** https://v2.tauri.app/plugin/file-system/
- **Tauri SQL Plugin:** https://v2.tauri.app/plugin/sql/

---

## 🐛 Common Issues & Solutions

### Issue: "forbidden path" error
**Solution:** Add path to `src-tauri/capabilities/default.json`

### Issue: Settings not persisting
**Solution:** Check both settings.json locations exist and have correct content

### Issue: Tauri APIs undefined
**Solution:** Make sure running `npm run tauri dev`, not `npm run dev`

### Issue: Permission denied on file operations
**Solution:** Check Tauri capabilities allow the specific operation and path

---

## 🎯 Current Sprint Focus

**Phase 1: Settings & Infrastructure** ✅ COMPLETE
- [x] Settings management
- [x] First-run flow
- [x] Tauri permissions

**Phase 2: Model Management** 🚧 IN PROGRESS
- [ ] Database schema
- [ ] Model scanning
- [ ] Add/remove from Mac
- [ ] File operations

**Phase 3: UI Polish** 📅 UPCOMING
- [ ] Loading states
- [ ] Error handling
- [ ] Progress tracking

---

## 💡 Key Insights for New Context

1. **Ian cannot code Rust** - all logic must be JavaScript
2. **Old backend is broken** - don't reference it for logic, only for understanding what was attempted
3. **Two-location settings** - always save to both DTC_APP_DIR and STASH_DIR/App_Data
4. **Tauri-only app** - no browser support needed
5. **Frontend-first** - React hooks + Tauri plugins = complete solution

---

**Remember:** When in doubt, put logic in JavaScript, not Rust!
