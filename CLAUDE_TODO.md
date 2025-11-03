# DrawThings Companion - TODO List

**Last Updated:** 2025-11-03 (End of Day)

---

## 🎯 Current Status

✅ **WORKING STATE** - Application successfully displays models from database!

The application has been refactored from a backend-heavy Rust architecture to a **frontend-first JavaScript architecture** with lightweight Tauri API calls for file system access.

### ✅ Recently Completed

- [x] Created centralized `tauri_handler.js` for all backend communication
- [x] Implemented dual-location settings storage (DTC_APP_DIR + STASH_DIR/App_Data)
- [x] Built `app_init()` - reads .env and settings.json, merges configuration
- [x] Built `app_first_run()` - first-run setup wizard integration
- [x] Built `save_settings()` / `load_settings()` - manages settings.json
- [x] Wired up initialization flow in main app (page.js)
- [x] Fixed Tauri v2 permissions for file system access
- [x] Removed redundant backend calls (`get_app_paths`, old `initialize_app`)
- [x] Renamed functions for consistency (`app_*` pattern)
- [x] Updated SettingsView to display .env values and allow stash directory changes
- [x] Added SQLite database documentation to CLAUDE_NOTES.md
- [x] Implemented `get_models()` function using SQLite database
- [x] Updated frontend to read from database (useModels.js, TwoPaneManager.jsx)
- [x] Updated database schema to use display_name_original and display_name fields
- [x] Cleaned up deprecated documentation (removed 7 outdated files from _documentation/)
- [x] Added documentation guidelines to CLAUDE_NOTES.md
- [x] Added SQLite plugin to Rust backend (Cargo.toml, lib.rs, capabilities)
- [x] Implemented `init_database()` - creates database and tables automatically
- [x] **FIXED CRITICAL BUG:** Implemented `scan_mac_models()` to properly categorize models by consulting JSON files
- [x] Fixed path expansion for tilde (~) in configuration paths
- [x] Fixed Tauri permissions for read-dir and stat operations
- [x] Fixed model type parameter ('controlnet' → 'control')
- [x] Created APP_STARTUP_STEPS.md documenting first start and restart flows
- [x] **VERIFIED WORKING:** Main models, LoRAs, and ControlNets all displaying correctly from database

---

## 🚧 Next Steps

### **High Priority - Core Features**

1. **Model Management Operations** ⏳ NOT YET IMPLEMENTED
   - [x] 1.1) `get_models()` - ✅ WORKING - Reads models from SQLite database
   - [x] 1.2) `scan_mac_models()` - ✅ WORKING - Scans DrawThings directory, populates database correctly by model type
   - [ ] 1.3) `add_model_to_mac()` - Copy model from Stash to Mac HD, update database
   - [ ] 1.4) `remove_model_from_mac()` - Move model from Mac HD to Stash, update database
   - [ ] 1.5) `update_models_order()` - Update mac_display_order in database for drag & drop reordering
   - [ ] 1.6) `delete_model()` - Delete from database, optionally delete physical files
   - [ ] 1.7) `rescan_all_models()` - Manual rescan trigger (function exists but needs UI integration)

2. **Frontend Integration** ✅ COMPLETE
   - [x] 2.1) Updated `useModels.js` hook to work with flat database structure
   - [x] 2.2) Updated `TwoPaneManager.jsx` to display models from database
   - [x] 2.3) Updated model property references (filename, display_name, exists_mac_hd, mac_display_order)
   - [x] 2.4) Fixed LoRA strength display (divide by 10 for actual value)
   - [x] 2.5) SetupWizard displays .env values as defaults



3. ** .ckpt model data uimport to SQLite DB
- [x] 3.1) add main models to SQLite DB
- [x] 3.2) add LoRA to SQLite DB
- [ ] 3.3) add controlnet to SQLite DB
- [ ] 3.4) add vae to SQLite DB
- [ ] 3.5) add text_exncoder to SQLite DB
- [ ] 3.6) add image_encoder to SQLite DB
- [ ] 3.7) add image_encoder to SQLite DB
- [ ] 3.8) import master CSV model data for reference ⭐️⭐️⭐️




### **Medium Priority**

5. **Configuration Management**
   - [ ] `update_stash_dir()` - May be redundant, already handled in SettingsView
   - [ ] Review if these backend stubs are still needed

6. **File Operations**
   - [ ] Implement actual file moving (Mac ↔ Stash)
   - [ ] Handle symlinks vs actual file moves
   - [ ] Progress tracking for large file operations

7. **Error Handling**
   - [ ] Improve error messages throughout
   - [ ] Add user-friendly error modals
   - [ ] Handle edge cases (disconnected drives, permissions, etc.)

### **Low Priority**

8. **Testing**
   - [ ] Test with actual DrawThings models
   - [ ] Test stash directory on external drive (disconnect/reconnect)
   - [ ] Test first-run flow thoroughly
   - [ ] Test settings persistence across app restarts

9. **UI/UX Improvements**
   - [ ] Loading states during file operations
   - [ ] Progress bars for scans/imports
   - [ ] Confirmation dialogs for destructive actions
   - [ ] Better visual feedback

10. **Documentation**
    - [ ] User guide for first-run setup
    - [ ] Developer documentation for architecture
    - [ ] API documentation for tauri_handler functions

---

## 🐛 Known Issues

✅ **All Critical Issues Resolved!**

Previously fixed issues:
1. ~~Settings.json not created until first-run setup completes~~ - ✅ Fixed
2. ~~Tauri permission errors~~ - ✅ Fixed
3. ~~All .ckpt files being tagged as 'model' type~~ - ✅ Fixed - now properly categorizes by consulting JSON files
4. ~~Path expansion for tilde (~)~~ - ✅ Fixed
5. ~~Model type parameter mismatch ('controlnet' vs 'control')~~ - ✅ Fixed

### Remaining Work

**Model Operations** - The following functions exist as stubs in tauri_handler.js that call `invoke()`:
- `add_model_to_mac()` - needs implementation
- `remove_model_from_mac()` - needs implementation
- `update_models_order()` - needs implementation
- `delete_model()` - needs implementation

These are the next features to implement for full functionality.

---

## 🔮 Future Enhancements

- **Model Search/Filter** - Search by name, type, size
- **Batch Operations** - Select multiple models, bulk add/remove
- **Storage Analytics** - Show disk usage, stash capacity
- **Backup/Restore** - Export/import entire stash configuration
- **Model Metadata** - Display model details, thumbnails, descriptions
- **Auto-sync** - Automatically sync changes to stash
- **Version Control** - Track model versions, rollback capability

---

## 📝 Notes

- See `CLAUDE_NOTES.md` for architectural decisions and development rules
- See `backend_calls.md` for original backend API analysis
