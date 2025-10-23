# DrawThings Companion - TODO List

**Project Status:** In Development (Midpoint Code Review Completed - 2025-01-23)

---

## High Priority Tasks

### 1. ✅ ~~Implement Tailwind CSS Properly~~ **COMPLETE!**
**Status:** ✅ COMPLETED 2025-01-23 | **Priority:** HIGH
**Files:** All components, `tailwind.config.js`, `globals.css`

- [x] Create design tokens in `tailwind.config.js` (colors, spacing, typography)
- [x] Set up shared theme constants (`src/styles/theme.js`)
- [x] Migrate `Nav.js` to Tailwind
- [x] Migrate `LogViewer.js` to Tailwind
- [x] Migrate `LogModal.js` to Tailwind
- [x] Migrate `TwoPaneManager.jsx` to Tailwind
- [x] Migrate `SetupWizard.jsx` to Tailwind
- [x] Migrate `page.js` layout to Tailwind
- [x] Remove unused styled-jsx blocks after migration
- [x] Document Tailwind usage patterns in migration guide

**Result:** ✨ Eliminated ~688 lines of CSS, established design system
**Documentation:** `TASK_1_COMPLETE.md`, `TAILWIND_MIGRATION_GUIDE.md`

---

### 2. 🔧 Complete `copy_model_to_stash` Implementation **← CURRENT TASK**
**Status:** Critical - Incomplete | **Priority:** HIGH
**Files:** `src-tauri/src/commands.rs:198-232`, `src-tauri/src/file_ops.rs`

- [ ] Implement actual file copying logic in `copy_model_to_stash`
- [ ] Add source path tracking for models in database
- [ ] Add progress reporting for large file copies
- [ ] Add checksum verification after copy
- [ ] Test with various model file sizes
- [ ] Add error handling for insufficient disk space
- [ ] Log copy operations properly

**Current Issue:** Function is a placeholder and doesn't actually copy files

---

### 3. 🐛 Fix React Key Prop Anti-Pattern
**Status:** Bug | **Priority:** HIGH
**Files:** `src/components/LogModal.js:41`

- [ ] Replace `key={index}` with unique identifier
- [ ] Add unique ID generation to `LogEvent` in Rust logger
- [ ] Update `LogEvent` struct to include UUID or incremental ID
- [ ] Test log rendering with rapid additions/removals

**Current Issue:** Using array index as key causes React rendering issues

```javascript
// Current (line 41):
logs.map((log, index) => (
  <div key={index} className="log-entry">

// Should be:
logs.map((log) => (
  <div key={log.id} className="log-entry">
```

---

### 4. 🐛 Fix Race Condition in `useModels` Save Operation
**Status:** Bug | **Priority:** HIGH
**Files:** `src/hooks/useModels.js:104-143`

- [ ] Capture snapshot of `pendingChanges` at start of `saveChanges`
- [ ] Prevent user interactions during save (disable buttons)
- [ ] Add optimistic locking or transaction handling
- [ ] Test concurrent save scenarios

**Current Issue:** If user makes changes during save, `pendingChanges` array can be modified mid-operation

```javascript
// Fix needed at line 104:
const saveChanges = useCallback(async () => {
  const changesToSave = [...pendingChanges]; // Capture snapshot
  // ... rest of function uses changesToSave
}, [pendingChanges, macModels, loadModels]);
```

---

### 5. 🐛 Fix Setup Wizard Logic Flaw
**Status:** Bug | **Priority:** HIGH
**Files:** `src/app/page.js:30-36`

- [ ] Add explicit handling for all initialization states
- [ ] Add proper loading state transitions
- [ ] Test all state combinations (needsSetup × initialized × loading)

**Current Issue:** If `needsSetup=false` and `initialized=false`, neither wizard nor loading shows

---

### 6. 🗑️ Implement Delete Functionality
**Status:** Feature - Mentioned in README | **Priority:** HIGH
**Files:** `src-tauri/src/commands.rs`, `src/components/TwoPaneManager.jsx`

- [ ] Create `delete_model` Tauri command
- [ ] Add confirmation dialog before deletion
- [ ] Update database to mark model as deleted (soft delete)
- [ ] Add option to permanently delete from disk
- [ ] Update UI to show deleted models (with restore option)
- [ ] Add bulk delete functionality
- [ ] Test deletion with models in stash

**Priority:** Core feature mentioned in README

---

## Medium Priority Tasks

### 7. 💾 Add File Size and Space Validation
**Status:** Security/Reliability | **Priority:** MEDIUM
**Files:** `src-tauri/src/file_ops.rs`, `src-tauri/src/commands.rs`

- [ ] Add disk space checking before copy operations
- [ ] Implement maximum file size limits (configurable)
- [ ] Show available space in UI before operations
- [ ] Warn user if stash drive is getting full
- [ ] Add space usage statistics view

---

### 8. 🐛 Fix Timestamp Precision for Log Deduplication
**Status:** Bug - Low Impact | **Priority:** MEDIUM
**Files:** `src-tauri/src/logger.rs:14`, `src/components/LogViewer.js:38-49`

- [ ] Change timestamp format to include milliseconds
- [ ] Update deduplication logic in `LogViewer.js`
- [ ] Consider adding sequence numbers instead

**Current Issue:** Logs with same message in same second are treated as duplicates

```rust
// Current (logger.rs:14):
let timestamp = chrono::Local::now().format("%H:%M:%S").to_string();

// Should be:
let timestamp = chrono::Local::now().format("%H:%M:%S%.3f").to_string();
```

---

### 9. ⚡ Optimize Pending Changes in `useModels`
**Status:** Performance | **Priority:** MEDIUM
**Files:** `src/hooks/useModels.js:85-101`

- [ ] Deduplicate pending changes by `modelId` before adding
- [ ] Implement change compression (consolidate reorders)
- [ ] Add change history for undo functionality
- [ ] Consider using a Map instead of array for O(1) lookups

**Current Issue:** Every drag creates new pending changes, potentially hundreds of duplicate operations

---

### 10. 🐛 Fix Stale Closure in TwoPaneManager
**Status:** Bug - Low Impact | **Priority:** MEDIUM
**Files:** `src/components/TwoPaneManager.jsx:23-32`

- [ ] Wrap `onReorder` callback with `useCallback`
- [ ] Add proper dependency array
- [ ] Test drag-and-drop with prop changes

```javascript
// Add to parent component:
const handleReorder = useCallback((newOrder) => {
  // reorder logic
}, [/* dependencies */]);
```

---

### 11. 📝 Add Rust-Side Logging
**Status:** Developer Experience | **Priority:** MEDIUM
**Files:** All Rust files

- [ ] Add `tracing` or `log` crate to dependencies
- [ ] Set up logging infrastructure in `lib.rs`
- [ ] Add trace/debug logs to file operations
- [ ] Add info logs for important operations
- [ ] Add error logs with context
- [ ] Configure log levels by environment

---

### 12. 🛡️ Improve Error Handling with Custom Error Types
**Status:** Code Quality | **Priority:** MEDIUM
**Files:** All `src-tauri/src/*.rs` files

- [ ] Create `AppError` enum with `thiserror` crate
- [ ] Replace all `Result<T, String>` with `Result<T, AppError>`
- [ ] Implement proper error conversion (From trait)
- [ ] Add error context with line numbers
- [ ] Return structured errors to frontend
- [ ] Display user-friendly error messages in UI

---

### 13. 🎨 Add Drag-and-Drop Between Panes
**Status:** UX Improvement | **Priority:** MEDIUM
**Files:** `src/components/TwoPaneManager.jsx`

- [ ] Enable drag from Stash pane to Mac pane
- [ ] Add visual drag handles
- [ ] Show drop zones with visual feedback
- [ ] Add drag preview/ghost element
- [ ] Test across different screen sizes

**Current Issue:** Only click-to-add works, drag-and-drop only works within Mac pane

---

### 14. ⚠️ Add Confirmation Dialogs
**Status:** UX/Safety | **Priority:** MEDIUM
**Files:** `src/components/TwoPaneManager.jsx`, new `ConfirmDialog.js`

- [ ] Create reusable `ConfirmDialog` component
- [ ] Add confirmation before removing models from Mac
- [ ] Add confirmation before deleting models
- [ ] Add confirmation before discarding unsaved changes
- [ ] Add "Don't show again" option for power users

---

### 15. 📊 Implement Progress Indicators
**Status:** UX Improvement | **Priority:** MEDIUM
**Files:** `src-tauri/src/commands.rs`, new `ProgressModal.js`

- [ ] Add Tauri event for copy progress
- [ ] Create progress modal component
- [ ] Show progress bar with file name and percentage
- [ ] Allow background operation (minimize modal)
- [ ] Add cancel operation functionality
- [ ] Show estimated time remaining

---

## Code Quality & Architecture

### 16. 🔒 Add Path Validation and Security
**Status:** Security | **Priority:** MEDIUM
**Files:** `src-tauri/src/commands.rs`, `src-tauri/src/file_ops.rs`

- [ ] Validate all user-provided paths
- [ ] Check for path traversal attacks (`../../../etc/passwd`)
- [ ] Implement path length limits
- [ ] Validate path exists before operations
- [ ] Check symlink handling
- [ ] Add allowlist of valid base directories

---

### 17. ✅ Implement Checksum Verification
**Status:** Data Integrity | **Priority:** MEDIUM
**Files:** `src-tauri/src/commands.rs`, `src-tauri/src/file_ops.rs`

- [ ] Verify checksum after copying to stash
- [ ] Add checksum mismatch error handling
- [ ] Show checksum status in UI
- [ ] Add "Verify All" functionality
- [ ] Implement background verification on startup

---

### 18. 📝 Add Logging for Duplicate Models
**Status:** Developer Experience | **Priority:** LOW
**Files:** `src-tauri/src/commands.rs:269`

- [ ] Log when duplicate models are skipped during import
- [ ] Add statistics to scan results (duplicates found)
- [ ] Show duplicate information in UI
- [ ] Add option to re-scan/force import

---

### 19. 🏗️ Fix State Management Inconsistency
**Status:** Architecture | **Priority:** MEDIUM
**Files:** `src-tauri/src/commands.rs`

- [ ] Choose single source of truth: `AppState` vs database
- [ ] Document decision in code comments
- [ ] Refactor commands to use consistent approach
- [ ] Add cache invalidation strategy if using AppState

**Current Issue:** Some commands use AppState paths, others query database

---

### 20. 🔔 Add Background Thread Completion Events
**Status:** UX | **Priority:** LOW
**Files:** `src-tauri/src/lib.rs:76-94`

- [ ] Emit Tauri event when background initialization completes
- [ ] Update UI to show completion status
- [ ] Add retry mechanism if initialization fails
- [ ] Show progress during background operations

---

## UI/UX Improvements

### 21. 💀 Add Skeleton Loaders
**Status:** UX Polish | **Priority:** LOW
**Files:** All view components

- [ ] Create reusable `Skeleton` component
- [ ] Replace spinners with skeleton loaders for model lists
- [ ] Add skeleton for two-pane layout
- [ ] Animate skeleton shimmer effect

---

### 22. 🎭 Improve Empty States
**Status:** UX Polish | **Priority:** LOW
**Files:** `src/components/TwoPaneManager.jsx`

- [ ] Add illustrations to empty states
- [ ] Make empty states more actionable
- [ ] Add helpful tips for first-time users
- [ ] Add "Import Models" button in empty Mac pane

---

### 23. 🍞 Add Toast Notifications
**Status:** UX | **Priority:** MEDIUM
**Files:** New `components/Toast.js`, `hooks/useToast.js`

- [ ] Create toast notification system
- [ ] Show success toast after save operations
- [ ] Show error toasts with retry option
- [ ] Add toast for background operations completion
- [ ] Support multiple toasts with stacking

---

### 24. ⌨️ Add Keyboard Shortcuts
**Status:** UX/Accessibility | **Priority:** LOW
**Files:** `src/app/page.js`, new `hooks/useKeyboardShortcuts.js`

- [ ] Implement keyboard shortcut handler
- [ ] Add Cmd+S / Ctrl+S for save
- [ ] Add Esc to close modals
- [ ] Add Cmd+Z / Ctrl+Z for undo
- [ ] Add arrow keys for navigation
- [ ] Display keyboard shortcuts in UI (tooltip or help modal)

---

### 25. 🔍 Add Search and Filter Functionality
**Status:** Feature | **Priority:** MEDIUM
**Files:** `src/components/TwoPaneManager.jsx`

- [ ] Add search bar above model lists
- [ ] Implement fuzzy search on model names
- [ ] Add filters (by type, size, date)
- [ ] Highlight search results
- [ ] Show "X results found" message

---

## Performance Optimizations

### 26. 🚀 Add Virtualization for Large Lists
**Status:** Performance | **Priority:** LOW
**Files:** `src/components/TwoPaneManager.jsx`

- [ ] Install `react-window` or `react-virtual`
- [ ] Implement virtual scrolling for model lists
- [ ] Test with 1000+ models
- [ ] Ensure drag-and-drop works with virtualization

**Trigger:** If users have 500+ models, rendering will slow down

---

### 27. 💾 Implement Database Query Caching
**Status:** Performance | **Priority:** LOW
**Files:** `src-tauri/src/db/operations.rs`, `src/hooks/useModels.js`

- [ ] Cache `get_models_by_type` results in AppState
- [ ] Invalidate cache on mutations
- [ ] Add cache expiration strategy
- [ ] Benchmark query performance improvements

---

### 28. 📁 Optimize File Scanning
**Status:** Performance | **Priority:** LOW
**Files:** `src-tauri/src/commands.rs:164-196`

- [ ] Add progress reporting during scan
- [ ] Implement incremental scanning (only new files)
- [ ] Cache file metadata (size, checksum)
- [ ] Add "Quick Scan" vs "Full Scan" options
- [ ] Parallelize checksum calculation

---

### 29. 🔌 Implement Database Connection Pooling
**Status:** Performance/Architecture | **Priority:** LOW
**Files:** `src-tauri/src/lib.rs`, `src-tauri/src/commands.rs`

- [ ] Add `r2d2` crate for connection pooling
- [ ] Replace `Mutex<Connection>` with connection pool
- [ ] Test concurrent request handling
- [ ] OR: Consider migrating to async Tauri with `tokio-rusqlite`

---

## Testing & Documentation

### 30. 🧪 Add Unit Tests for Database Operations
**Status:** Testing | **Priority:** LOW
**Files:** `src-tauri/src/db/operations.rs`

- [ ] Write tests for `insert_model`
- [ ] Write tests for `get_models_by_type`
- [ ] Write tests for Mac model CRUD operations
- [ ] Write tests for config operations
- [ ] Set up test database fixture

---

### 31. 🧪 Add React Component Tests
**Status:** Testing | **Priority:** LOW
**Files:** All component files

- [ ] Set up React Testing Library
- [ ] Write tests for `LogViewer`
- [ ] Write tests for `LogModal`
- [ ] Write tests for `TwoPaneManager`
- [ ] Mock Tauri commands for testing

---

### 32. 🧪 Add E2E Tests
**Status:** Testing | **Priority:** LOW
**Files:** New `tests/` directory

- [ ] Set up Playwright or Tauri testing framework
- [ ] Write E2E test for setup wizard flow
- [ ] Write E2E test for adding/removing models
- [ ] Write E2E test for save/cancel workflow
- [ ] Write E2E test for log viewing

---

### 33. 📘 Add TypeScript Support
**Status:** Code Quality | **Priority:** LOW
**Files:** All `.js` and `.jsx` files

- [ ] Initialize TypeScript in Next.js project
- [ ] Rename files to `.tsx`
- [ ] Add type definitions for Tauri commands
- [ ] Add types for custom hooks
- [ ] Add types for all components
- [ ] Configure strict TypeScript settings

---

### 34. 📚 Improve Documentation
**Status:** Documentation | **Priority:** LOW
**Files:** `README.md`, new `CONTRIBUTING.md`, `ARCHITECTURE.md`

- [ ] Document setup process in detail
- [ ] Add architecture diagram
- [ ] Document database schema
- [ ] Document Tauri commands API
- [ ] Add troubleshooting section
- [ ] Create development guide

---

## Future Features

### 35. 📦 Implement Stash Sets (from README)
**Status:** Future Feature | **Priority:** LOW
**Files:** New components and commands

- [ ] Design Stash Sets data model
- [ ] Create UI for managing sets
- [ ] Implement set activation/deactivation
- [ ] Add import/export for sets
- [ ] Document use cases

---

### 36. ✨ Add Batch Operations
**Status:** Feature | **Priority:** MEDIUM
**Files:** `src/components/TwoPaneManager.jsx`

- [ ] Add multi-select mode (checkboxes)
- [ ] Implement bulk add to Mac
- [ ] Implement bulk remove from Mac
- [ ] Implement bulk delete
- [ ] Add "Select All" / "Deselect All" buttons

---

### 37. 🖼️ Add Model Preview/Metadata Display
**Status:** Feature | **Priority:** LOW
**Files:** `src/components/TwoPaneManager.jsx`

- [ ] Show model thumbnails (if available)
- [ ] Display additional metadata (author, version, tags)
- [ ] Add quick preview on hover
- [ ] Integrate with CivitAI API for model info (optional)

---

### 38. ↩️ Implement Undo/Redo System
**Status:** Feature | **Priority:** LOW
**Files:** New `hooks/useHistory.js`, all view components

- [ ] Create history manager hook
- [ ] Track all model operations
- [ ] Implement undo/redo buttons
- [ ] Add keyboard shortcuts (Cmd+Z / Cmd+Shift+Z)
- [ ] Show operation history in UI

---

### 39. 💾 Add Export/Import Configuration
**Status:** Feature | **Priority:** LOW
**Files:** New settings view

- [ ] Export current configuration as JSON
- [ ] Import configuration from file
- [ ] Validate imported configuration
- [ ] Support backup/restore of entire app state

---

### 40. 📊 Add Analytics/Statistics View
**Status:** Feature | **Priority:** LOW
**Files:** New `components/views/StatsView.js`

- [ ] Show total storage used
- [ ] Show models by type (pie chart)
- [ ] Show largest models
- [ ] Show recently added models
- [ ] Show stash space savings

---

## Original TODO Items

### 101. 🗑️ Delete Embeddings
**Status:** Not Started | **Priority:** MEDIUM
**Notes:** Part of general delete functionality (see Task #6)

---

### 1001. 🎨 Make Custom Icons
**Status:** Not Started | **Priority:** LOW

- [ ] Design custom app icon
- [ ] Create icon variations for different sizes
- [ ] Replace Lucide icons with custom icons where appropriate
- [ ] Export icons in required formats for Tauri

---

## Completed Tasks
<!-- Move completed tasks here with completion date -->

---

## Summary Statistics

- **Total Tasks:** 42
- **High Priority:** 6
- **Medium Priority:** 14
- **Low Priority:** 22
- **Completion Target:** TBD
- **Current Focus:** 🎯 Task #1 - Implement Tailwind CSS

---

## Priority Legend

- 🔴 **HIGH:** Critical bugs, incomplete features, security issues, core functionality
- 🟡 **MEDIUM:** Code quality improvements, UX enhancements, non-critical bugs
- 🟢 **LOW:** Polish, future features, nice-to-haves, optimizations

---

**Last Updated:** 2025-01-23
**Next Review:** After completing Task #1
