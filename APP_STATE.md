# Application State Documentation

## Overview
This document catalogs all React `useState` hooks used throughout the Draw Things Companion application frontend (`/src` directory).

**Total State Variables:** 38 across 13 files

> **Note:** This document was last updated after refactoring to remove the redundant `initialized` state from `useAppInitialization` hook.

---

## State by Component/Hook

### 1. useAppInitialization Hook
**File:** `src/hooks/useAppInitialization.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `loading` | `true` | Boolean | Loading state while checking initialization status |
| `error` | `null` | String/null | Stores error messages from initialization failures |
| `needsSetup` | `false` | Boolean | Indicates if first-run setup wizard is required |
| `config` | `null` | Object/null | Stores loaded configuration from `app_init()` |

**Usage:** Main initialization hook called on app startup to verify configuration and setup status.

**Note:** Previously had redundant `initialized` state (inverse of `needsSetup`) - removed in refactor.

---

### 2. Main Page Component
**File:** `src/app/page.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `activeSection` | `'models'` | String | Tracks currently active navigation section for view rendering |

**Usage:** Controls which main view is displayed (models, projects, scripts, etc.).

---

### 3. useModels Hook
**File:** `src/hooks/useModels.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `models` | `[]` | Array | All models from both Mac and Stash locations |
| `macModels` | `[]` | Array | Models that exist on Mac HD |
| `stashModels` | `[]` | Array | Models in the Stash directory |
| `loading` | `true` | Boolean | Loading state while fetching models |
| `saving` | `false` | Boolean | Saving state while persisting changes |
| `error` | `null` | String/null | Error messages from model operations |
| `pendingChanges` | `[]` | Array | Tracks unsaved model actions (add/remove/reorder) |
| `hasUnsavedChanges` | `false` | Boolean | Flag indicating presence of unsaved changes |

**Usage:** Central state management for model data and operations.

---

### 4. SetupWizard Component
**File:** `src/components/SetupWizard.jsx`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `dtBaseDir` | `config?.DT_BASE_DIR` or default path | String | DrawThings base directory path |
| `stashDir` | `config?.STASH_DIR` or default path | String | Stash directory path |
| `loading` | `false` | Boolean | Loading state during setup submission |
| `error` | `null` | String/null | Error messages during setup |

**Default Paths:**
- DT Base: `/Users/YOUR_USERNAME/Library/Containers/com.liuliu.draw-things/Data/Documents`
- Stash: `/Volumes/Extreme2Tb/__DrawThings_Stash__`

**Usage:** First-run configuration wizard for setting up directory paths.

---

### 5. TwoPaneManager Component
**File:** `src/components/TwoPaneManager.jsx`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `showModal` | `false` | Boolean | Controls model details modal visibility |
| `selectedModel` | `null` | Object/null | Currently selected model for detail view |
| `showDeleteConfirm` | `false` | Boolean | Controls delete confirmation dialog visibility |
| `modelToDelete` | `null` | Object/null | Model being deleted (for confirmation) |
| `deleteFiles` | `false` | Boolean | Checkbox: also delete files from disk |
| `deleting` | `false` | Boolean | Loading state during delete operation |

**Usage:** Manages the two-pane layout (list + details) and model operations.

---

### 6. SettingsView Component
**File:** `src/components/views/SettingsView.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `paths` | `{ drawThingsPath: '', stashPath: '' }` | Object | Directory path configuration |
| `isLoading` | `true` | Boolean | Loading state while fetching settings |
| `isSaving` | `false` | Boolean | Saving state while updating settings |

**Usage:** Application settings management interface.

---

### 7. LogViewer Component
**File:** `src/components/LogViewer.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `logs` | `[]` | Array | All log entries (historical + real-time) |
| `isActive` | `false` | Boolean | Whether actively receiving new log events |
| `showModal` | `false` | Boolean | Controls full logs modal visibility |
| `flashClass` | `''` | String | CSS class for flash animation on new logs |

**Usage:** Real-time log viewer with event listening and display.

---

### 8. Nav Component
**File:** `src/components/Nav.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `active` | `activeItem` prop (default: `'models'`) | String | Currently active navigation item |

**Usage:** Navigation component state tracking.

---

### 9. ScriptsView Component
**File:** `src/components/views/ScriptsView.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `scripts` | Array of 3 mock scripts | Array | List of available scripts with metadata |

**Mock Data Structure:**
```javascript
{ id, name, description, language, lastRun, status }
```

**Usage:** Display and manage automation scripts (currently using mock data).

---

### 10. ProjectsView Component
**File:** `src/components/views/ProjectsView.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `projects` | Array of 3 mock projects | Array | List of projects with metadata |

**Mock Data Structure:**
```javascript
{ id, name, description, images, lastModified, thumbnail }
```

**Usage:** Project gallery and management (currently using mock data).

---

### 11. EmbeddingsView Component
**File:** `src/components/views/EmbeddingsView.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `embeddings` | Array of 3 mock embeddings | Array | List of embeddings with metadata |

**Mock Data Structure:**
```javascript
{ id, name, type, size, location, tags }
```

**Usage:** Embeddings/textual inversions management (currently using mock data).

---

### 12. StashesView Component
**File:** `src/components/views/StashesView.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `stashes` | Array with 1 mock stash | Array | List of connected stashes with storage info |

**Mock Data Structure:**
```javascript
{ id, name, path, type, status, size, used }
```

**Usage:** External storage/stash management (currently using mock data).

---

### 13. TauriTest Component
**File:** `src/components/TauriTest.js`

| State Variable | Initial Value | Type | Purpose |
|---|---|---|---|
| `output` | `''` | String | Test output/results from backend tests |
| `loading` | `false` | Boolean | Loading state while running tests |

**Usage:** Development/testing component for Tauri backend integration.

---

## State Patterns & Categories

### Loading States (9 instances)
- `loading`, `isLoading`, `saving`, `isSaving`, `deleting`
- Used for async operations and user feedback

### Error States (4 instances)
- `error` - Stores error messages from failed operations

### Modal/UI States (5 instances)
- `showModal`, `showDeleteConfirm`, `flashClass`
- Controls visibility and UI state of dialogs/overlays

### Data Collections (11 instances)
- Arrays: `models`, `macModels`, `stashModels`, `logs`, `scripts`, `projects`, `embeddings`, `stashes`, `pendingChanges`
- Store lists of entities

### Selection States (3 instances)
- `selectedModel`, `modelToDelete`, `activeSection`
- Track user selections

### Configuration States (4 instances)
- `config`, `paths`, `dtBaseDir`, `stashDir`
- Application and path configuration

### Boolean Flags (7 instances)
- `initialized`, `needsSetup`, `deleteFiles`, `isActive`, `hasUnsavedChanges`
- Simple true/false tracking

---

## State Flow Diagram

```
App Startup
    ↓
useAppInitialization
    ├─ loading ────────→ true → false
    ├─ error ──────────→ null / error message
    ├─ needsSetup ─────→ determines if SetupWizard shown
    └─ config ─────────→ loaded configuration
         ↓
    [needsSetup = true]
         ↓
    SetupWizard
    ├─ dtBaseDir ──────→ user input
    ├─ stashDir ───────→ user input
    ├─ loading ────────→ submission state
    └─ error──────────→ validation errors
         ↓
    Main App (page.js)
    └─ activeSection ──→ determines view
         ↓
    useModels Hook (if models view active)
    ├─ models ─────────→ combined data
    ├─ macModels ──────→ Mac HD models
    ├─ stashModels ────→ Stash models
    ├─ pendingChanges ─→ unsaved operations
    └─ hasUnsavedChanges → save prompt trigger
```

---

## Notes

1. **Framework:** Next.js 13+ with `'use client'` directive (Client Components)
2. **Mock Data:** Several views (Scripts, Projects, Embeddings, Stashes) currently use mock data
3. **State Management:** Pure React useState (no Redux/Zustand/etc.)
4. **Common Patterns:**
   - Loading/Error states for async operations
   - Separate states for different data sources (Mac vs Stash)
   - Pending changes pattern for batched updates
5. **Total useState Count:** 38 declarations (reduced from 39 after removing redundant `initialized` state)

---

## Future Considerations

- Consider consolidating similar loading/error states with a custom hook
- Mock data views need backend integration
- Potential for context-based state management for deeply nested components
- Consider useReducer for complex state like `useModels` hook
