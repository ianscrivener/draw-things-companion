# DrawThings Companion - TODO List

**Last Updated:** 2025-11-03

---

## 🎯 Current Status

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

---

## 🚧 In Progress / Next Steps

### **High Priority**

1. **Implement Model Management (Frontend Logic)**
   - [x] 1.1) `get_models()` - Reads models from SQLite database, filters by type, returns with Mac/Stash status
   - [ ] 1.2) `add_model_to_mac()` - Update database record (set exists_mac_hd=true, mac_display_order)
   - [ ] 1.3) `remove_model_from_mac()` - Update database record (set exists_mac_hd=false, mac_display_order=null)
   - [ ] 1.4) `update_models_order()` - Update mac_display_order in database for multiple models
   - [ ] 1.5) `delete_model()` - Delete from database, optionally delete files

2. **Frontend Integration with Database**
   - [x] 2.1) Updated `useModels.js` hook to work with new flat database structure
   - [x] 2.2) Updated `TwoPaneManager.jsx` to display models from database
   - [x] 2.3) Updated model property references (filename, display_name, exists_mac_hd, mac_display_order)
   - [x] 2.4) Fixed LoRA strength display (divide by 10 for actual value)



### **Medium Priority**

5. **Configuration Management**
   - [ ] `get_config_value()` - Read from settings.json (may be redundant with app_init)
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

1. **Settings.json not created until first-run setup completes**
   - Fixed: SetupWizard now properly wired up

2. **Tauri permission errors**
   - Fixed: Updated capabilities/default.json with proper file system permissions

3. **Backend function stubs still present**
   - Some backend functions in tauri_handler.js are stubs that call `invoke()`
   - These need to be replaced with frontend logic or removed

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
