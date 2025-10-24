# Claude Code Review - To Do List

**Date**: 2025-10-24
**Reviewed by**: Claude Code

## Architectural Principle
**The files and JSON are the source of truth. The SQLite DB reflects this for convenience.**

---

## Major Issues Identified

### 1. **CRITICAL: No JSON Parsing Implementation**

**Current State**:
- Documentation states that model types should be determined from DrawThings JSON files:
  - `custom.json` (main models with CLIP/text encoder relationships)
  - `custom_lora.json` (LoRA models)
  - `custom_controlnet.json` (ControlNet models)
- There is **zero code** that reads these JSON files
- Current implementation uses naive filename-based detection in `src-tauri/src/commands.rs:414`

**Impact**:
- Cannot accurately determine model types
- Missing display names from JSON
- Missing LoRA strength values
- Missing display order from JSON array positions
- Cannot establish model relationships (main model → encoders)

**Required Implementation**:
- Parse `custom.json`, `custom_lora.json`, `custom_controlnet.json`
- Extract model metadata (display names, types, strength values)
- Use JSON array position for display order
- Extract relationships (main models → CLIP/text encoders, VAEs)

---

### 2. **Missing Model Relationships**

**Current State**:
- `ckpt_x_ckpt` table exists in schema but is never populated
- All relationship functions marked `#[allow(dead_code)]` in `operations.rs:183-222`
- No code reads `clip_encoder`, `text_encoder`, `autoencoder` fields from `custom.json`

**Impact**:
- Cannot track which encoders are used by which main models
- Cannot prevent deletion of shared encoders
- Cannot copy all required files for a main model

**Required Implementation**:
- Parse relationships from `custom.json`
- Populate `ckpt_x_ckpt` table with parent/child relationships
- Enable relationship query functions
- Add cascade logic for copying/moving models with dependencies

---

### 3. **Missing Data from JSON**

**Current State**:
Fields that should be populated from JSON but aren't:
- `display_name` - currently always `None`
- `lora_strength` - currently always `None`
- `mac_display_order` - based on filesystem scan order, not JSON order

**Impact**:
- Models display with filenames instead of user-friendly names
- LoRA strength settings are lost
- Display order doesn't match DrawThings app

**Required Implementation**:
- Extract display names from JSON object fields
- Extract LoRA strength from `custom_lora.json` entries
- Use JSON array index as `mac_display_order`

---

### 4. **Stash Directory Structure Mismatch**

**Current State**:
- `App_logic.md` describes structured stash with subdirectories:
  ```
  Data/
    Clip_encoders/
    Controls/
    LoRAs/
    Main_models/
    Text_encoders/
    VAEs/
  ```
- `copy_model_to_stash()` copies to flat directory: `stash_dir.join(&model.filename)`

**Impact**:
- Stash directory becomes cluttered with all file types mixed
- Harder to manage and browse files manually
- Doesn't match documented architecture

**Required Implementation**:
- Create subdirectory structure in stash
- Route files to correct subdirectory based on `model_type`
- Update `source_path` tracking to handle subdirectories
- Add stash scanning that searches all subdirectories

---

### 5. **Schema Design Considerations**

**Current State**:
- v3 schema flattened the normalized structure
- Old schema (v1): Separate `models`, `mac_models`, `stash_models` tables (normalized)
- New schema (v3): Single `ckpt_models` table with boolean flags

**Potential Issues**:
- Current design assumes all models are discovered from Mac HD first
- No way to import models that exist only in stash
- `scan_mac_models()` is the only entry point for new models

**Consider**:
- Adding `scan_stash_models()` function
- Both scans should merge data into the unified table
- Support models that exist only in one location

---

## Implementation Priority

### Priority 1: JSON Parsing (CRITICAL)
1. Create JSON data structures matching DrawThings format
2. Implement parsers for `custom.json`, `custom_lora.json`, `custom_controlnet.json`
3. Extract model metadata and relationships
4. Update `scan_mac_models()` to use JSON data instead of filename detection
5. Populate display names, strengths, and correct model types

### Priority 2: Model Relationships
1. Parse relationship fields from `custom.json` (clip_encoder, text_encoder, autoencoder)
2. Populate `ckpt_x_ckpt` table during scan
3. Enable relationship query functions
4. Add UI to show model dependencies

### Priority 3: Stash Scanning
1. Implement `scan_stash_models()` function
2. Support discovering models that only exist in stash
3. Merge stash and Mac HD data correctly

### Priority 4: Stash Directory Structure
1. Create subdirectory structure on stash initialization
2. Update `copy_model_to_stash()` to use subdirectories
3. Update scanning to search subdirectories
4. Handle migration of existing flat stash structures

### Priority 5: Data Consistency
1. Add validation that files exist at expected paths
2. Add sync detection (has JSON changed since last scan?)
3. Add commands to refresh from JSON files
4. Handle deleted files gracefully

---

## Additional Notes

### Face Restorer & Upscaler Models
Per `parsing_json_and_models_directory_list.md:26-27`:
- These model types are NOT in the 3 main JSON files
- Should be matched from filename patterns in `/settings.json`
- Current implementation tries to detect from filename only

### Model Type Detection Priority
Should follow this hierarchy:
1. Found in `custom_lora.json` → type = `lora`
2. Found in `custom_controlnet.json` → type = `control`
3. Found as main `file` in `custom.json` → type = `model`
4. Found as `clip_encoder` in `custom.json` → type = `clip`
5. Found as `text_encoder` in `custom.json` → type = `text`
6. Found as `autoencoder` in `custom.json` → type = `vae`
7. Matched in `/settings.json` → type = `face_restorer` or `upscaler`
8. Otherwise → type = `unknown`

### Unknown Models
Models that exist in the Models directory but aren't referenced in any JSON should be:
- Imported with type = `unknown`
- Flagged for user review
- Potentially safe to archive/delete
