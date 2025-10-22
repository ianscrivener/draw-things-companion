# Notes for AI Code Assistants

## Quick Start Context

This is **DrawThings Companion**, a Tauri v2 + Next.js desktop app for managing AI image generation models, LoRAs, and assets used with the DrawThings macOS app.

### Core Purpose
- Manage large model files (SDXL, SD1.5, LoRAs, ControlNets, Embeddings)
- Move models to a single external "Stash" (external drives) to save local disk space
- Track metadata and organize projects


## Tech Stack

- **Frontend**: Next.js 14.2.3 (React 18, App Router)
- **Desktop Framework**: Tauri v2.8.5
- **Backend**: Rust (via Tauri)
- **Styling**: Scoped CSS with `styled-jsx`
- **Icons**: `lucide-react`
- **Database**: SQLite (via tauri-plugin-sql) - not yet implemented


## Project Structure

```
draw-things-companion/
├── src/                          # Next.js frontend
│   ├── app/
│   │   ├── layout.js            # Root layout with fonts
│   │   ├── page.js              # Main app shell with nav + view routing
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── Nav.js               # Left sidebar navigation (90px wide)
│   │   ├── TauriTest.js         # Test component for Tauri functionality
│   │   └── views/               # 8 main view components
│   │       ├── StashesView.js
│   │       ├── ModelsView.js
│   │       ├── LoRAsView.js
│   │       ├── ControlNetsView.js
│   │       ├── EmbeddingsView.js
│   │       ├── ProjectsView.js
│   │       ├── ScriptsView.js
│   │       ├── SettingsView.js
│   │       └── index.js         # Barrel exports
│   └── lib/
│       └── tauri.js             # Tauri API wrappers & helper functions
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   └── lib.rs               # Main Tauri app with plugin initialization
│   ├── Cargo.toml               # Rust dependencies (includes plugins)
│   ├── tauri.conf.json          # Tauri config (shell commands, window settings)
│   └── capabilities/
│       └── default.json         # Permissions (fs, shell, sql)
└── TAURI_INTEGRATION.md         # Detailed Tauri setup documentation
```

## Architecture Overview

### Frontend Flow
1. **`page.js`** - Root component managing active view state
2. **`Nav.js`** - Sidebar navigation (8 items), calls `onNavigate(sectionId)`
3. **View Components** - Each view is self-contained with its own state and styles
4. **`tauri.js`** - Wrapper functions for all Tauri backend operations

### Backend Capabilities
- **File System**: Read, write, move, copy, delete files/directories
- **Shell Commands**: bash, jq, mv, ls, cp, mkdir, xz, zip, rm, openssl, shasum
- **SQLite Database**: Query and execute SQL (not yet used in UI)

## Key Files to Know

### `src/app/page.js`
Main app shell. Contains:
- Navigation state management
- `renderView()` - Switches between 8 views based on active section
- Footer with status bar

### `src/components/Nav.js`
Left sidebar with 8 navigation items:
```javascript
[
  { id: 'stashes', icon: BriefcaseBusiness, label: 'Stashes' },
  { id: 'models', icon: Image, label: 'Models' },
  { id: 'loras', icon: SquarePen, label: 'LoRAs' },
  { id: 'controlnets', icon: Factory, label: 'ControlNets' },
  { id: 'embeddings', icon: ArchiveRestore, label: 'Embeddings' },
  { id: 'projects', icon: Presentation, label: 'Projects' },
  { id: 'scripts', icon: FileJson2, label: 'Scripts' },
  { id: 'settings', icon: Settings, label: 'Settings' }
]
```

### `src/lib/tauri.js`
**IMPORTANT**: All Tauri operations should use this file. Contains:

#### Shell Command Wrappers
```javascript
executeBash(args)           // Run bash commands
listDirectory(args)         // ls command
moveFile(source, dest)      // mv command
copyFile(source, dest, recursive)
makeDirectory(path, createParents)
removeFile(path, { recursive, force })
executeOpenssl(args)
calculateShasum(path, algorithm)
getFileSha256(path)         // Get SHA-256 hash of file
```

#### File System Operations
```javascript
readTextFile(path)
writeTextFile(path, content)
readDir(path)
exists(path)
createDir(path, options)
rename(oldPath, newPath)
copy(source, dest)
```

#### SQLite Operations
```javascript
loadDatabase(path)
executeQuery(db, query, bindings)
executeStatement(db, statement, bindings)
```

#### Helper Functions
```javascript
getDrawThingsPath()         // Returns ~/Library/Containers/com.liuliu.draw-things/Data/Documents
scanModelFiles(subdir)      // Scan for .safetensors files in DrawThings directory
```

### `src-tauri/tauri.conf.json`
**Shell Command Scope**: Only these commands are allowed:
- bash, jq, mv, ls, cp, mkdir, xz, zip, rm, openssl, shasum

To add new commands, update the `plugins.shell.scope` array.

### `src-tauri/capabilities/default.json`
**Permissions**: Lists all allowed operations (fs, shell, sql)

## Current State (What's Built)

### ✅ Complete
1. **Tauri Backend Integration**
   - All plugins configured (shell, fs, sql)
   - Permissions set up
   - API wrapper library (`tauri.js`) complete

2. **Navigation System**
   - 90px left sidebar
   - 8 navigation items with icons
   - Active state management

3. **All 8 View Components**
   - Each view has mock data and UI
   - Consistent styling and layout
   - Search, filter, and action buttons

4. **UI Components Created**
   - StashesView: Grid of external storage locations
   - ModelsView: List of main models with archive buttons
   - LoRAsView: Grid/list toggle, categories
   - ControlNetsView: Grid cards with type badges
   - EmbeddingsView: List with tags
   - ProjectsView: Project cards with thumbnails
   - ScriptsView: Automation scripts with run buttons
   - SettingsView: Configuration sections

### ⚠️ Not Yet Implemented
1. **Database Schema**: SQLite tables not created
2. **Real Data Integration**: Views use mock data
3. **Tauri Commands**: No custom Rust commands yet
4. **File Operations**: UI buttons not connected to `tauri.js` functions
5. **Stash Management**: Core feature logic not implemented
6. **Model Scanning**: Real file scanning not integrated
7. **Error Handling**: No error boundaries or user feedback

## Development Workflow

### Run Development Server (Next.js only)
```bash
npm run dev
# Opens on http://localhost:3000 (or 3002 if 3000 is in use)
```

### Run Full Tauri App
```bash
npm run tauri dev
# Builds Rust backend + launches desktop window with Next.js
```

### Build for Production
```bash
npm run tauri build
# Creates platform-specific installers in src-tauri/target/release/bundle/
```

## Common Patterns & Conventions

### Styling
- **All components use scoped CSS** via `styled-jsx`
- Colors: Primary accent is `#ff5f57` (coral red)
- Neutrals: `#f5f5f5` (light gray), `#e0e0e0` (borders)
- No external CSS files except `globals.css`

### Component Structure
```javascript
'use client';  // All components are client components

import { useState } from 'react';
import { IconName } from 'lucide-react';

export default function ViewName() {
  const [state, setState] = useState([]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <IconName size={28} />
          <h1>Title</h1>
        </div>
        <div className="header-actions">
          {/* Buttons */}
        </div>
      </div>

      <div className="view-content">
        {/* Main content */}
      </div>

      <style jsx>{`
        /* Scoped styles */
      `}</style>
    </div>
  );
}
```

### Tauri Integration Pattern
```javascript
import { executeBash, readDir, exists } from '@/lib/tauri';

async function handleAction() {
  try {
    const result = await executeBash(['-c', 'echo "Hello"']);
    console.log(result.stdout);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Important Implementation Notes

### DrawThings File Locations
```
~/Library/Containers/com.liuliu.draw-things/Data/Documents/
├── models/              # Main models (.safetensors)
├── loras/               # LoRA files
├── controlnet/          # ControlNet models
└── textual_inversion/   # Embeddings
```

### Model File Detection
- Look for `.safetensors` files (primary format)
- Use SHA-256 hashes to identify models uniquely
- File sizes range from KB (embeddings) to 7+ GB (SDXL models)

### Stash Concept
- "Stash" = External drive location for archiving models
- Moving to stash: `mv` file from local to external path
- Restoring from stash: `mv` file back to DrawThings directory
- Track locations in SQLite database (to be implemented)

## Next Steps (What Needs Building)

1. **Database Schema**
   ```sql
   CREATE TABLE stashes (id, name, path, status);
   CREATE TABLE models (id, name, path, hash, size, type, stash_id);
   CREATE TABLE metadata (model_id, key, value);
   ```

2. **Model Scanner**
   - Use `readDir()` to scan DrawThings directories
   - Calculate SHA-256 for each `.safetensors` file
   - Store in database

3. **Stash Operations**
   - Add stash: Store path in DB
   - Move to stash: `moveFile()` + update DB
   - Restore from stash: `moveFile()` + update DB
   - Check disk space: Use `executeBash(['df', '-h', path])`

4. **Real Data Integration**
   - Replace mock data in views with DB queries
   - Add loading states
   - Add error handling

5. **Script System**
   - Store scripts in DB or files
   - Execute via `executeBash()`
   - Capture and display output

## Testing Tauri Functions

Use the `<TauriTest />` component in `page.js`:
```javascript
import TauriTest from '@/components/TauriTest';

// In render:
<TauriTest />
```

This component has buttons to test shell commands, file system operations, and model scanning.

## Common Issues & Solutions

### "Command not allowed"
- Add command to `src-tauri/tauri.conf.json` under `plugins.shell.scope`

### "Permission denied"
- Add permission to `src-tauri/capabilities/default.json`

### "Plugin not found"
- Check `Cargo.toml` has plugin dependency
- Check `lib.rs` has `.plugin()` initialization
- Check npm package is installed

### Build Errors
```bash
cd src-tauri
cargo clean
cd ..
npm run tauri build
```

## Design System

### Colors
- **Primary Accent**: `#ff5f57` (coral red)
- **Backgrounds**: `#fafafa` (main), `#ffffff` (cards), `#f5f5f5` (inputs)
- **Borders**: `#e0e0e0`, `#d0d0d0`
- **Text**: `#333` (primary), `#666` (secondary), `#999` (tertiary)
- **Success**: `#d4edda` (bg), `#155724` (text)
- **Info**: `#e3f2fd` (bg), `#1976d2` (text)

### Typography
- **Font Family**: Inter (weights: 400, 500, 600)
- **Sizes**:
  - H1: 24px (weight 600)
  - H2: 18px (weight 600)
  - H3: 16-17px (weight 600)
  - Body: 14px
  - Small: 13px
  - Tiny: 12px

### Spacing
- **Nav width**: 90px
- **Content padding**: 32px
- **Card gaps**: 12-24px
- **Button padding**: 10px 20px
- **Footer height**: 25px

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Run dev server (frontend only)
npm run dev

# Run full Tauri app
npm run tauri dev

# Build production app
npm run tauri build

# Add Rust dependency
cd src-tauri && cargo add package-name

# Add npm dependency
npm install package-name
```

## Files You'll Edit Most

1. **`src/components/views/*.js`** - Adding features to views
2. **`src/lib/tauri.js`** - Adding new Tauri helper functions
3. **`src-tauri/src/lib.rs`** - Adding custom Rust commands
4. **`src-tauri/tauri.conf.json`** - Configuring shell commands & app settings

## Pro Tips

1. **Always use `tauri.js` wrappers** instead of importing Tauri APIs directly
2. **Test in Tauri dev mode**, not just Next.js - some APIs only work in Tauri
3. **Check file paths** - macOS uses `/Users/`, not `C:\`
4. **Use prepared statements** for SQL to prevent injection
5. **Handle errors** - File operations can fail if paths don't exist
6. **Check permissions** - Make sure shell commands are in the scope list
7. **Mock data is temporary** - All views have placeholder data to be replaced
8. **Scoped CSS only** - Don't add global styles unless absolutely necessary

## Key Files Summary

| File | Purpose | Edit When |
|------|---------|-----------|
| `src/app/page.js` | Main app shell | Adding new views or changing layout |
| `src/components/Nav.js` | Navigation | Adding/removing nav items |
| `src/components/views/*.js` | View components | Building features for each section |
| `src/lib/tauri.js` | Tauri API wrappers | Adding new backend operations |
| `src-tauri/src/lib.rs` | Rust backend | Adding custom Tauri commands |
| `src-tauri/tauri.conf.json` | Tauri config | Adding shell commands, changing app settings |
| `src-tauri/capabilities/default.json` | Permissions | Adding new capabilities |

---

**Last Updated**: 2025-10-18
**Current Status**: UI complete with mock data, backend integration ready, database and business logic not yet implemented
