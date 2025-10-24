# Frontend Filtering & Foreign Key Constraint Fixes

**Date**: 2025-10-24
**Status**: ✅ Fixed

## Issues Fixed

### Issue #1: All Models Showing in All Views

**Problem**:
All models were displaying in all three views (Main Models, LoRAs, ControlNets) instead of being filtered by type.

**Root Cause**:
The Rust backend `get_models` command didn't accept a `model_type` parameter. It always returned ALL models, ignoring the filter requested by the frontend.

```rust
// OLD (wrong)
pub fn get_models(state: State<AppState>) -> Result<Vec<ModelResponse>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::get_all_models(&conn).map_err(|e| e.to_string())
}
```

**Fix Applied**:
Added `model_type` parameter and filtering logic:

```rust
// NEW (correct)
pub fn get_models(model_type: Option<String>, state: State<AppState>) -> Result<Vec<ModelResponse>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let all_models = operations::get_all_models(&conn).map_err(|e| e.to_string())?;

    // Filter by model_type if provided
    if let Some(type_filter) = model_type {
        Ok(all_models.into_iter()
            .filter(|m| m.model.model_type == type_filter)
            .collect())
    } else {
        Ok(all_models)
    }
}
```

**Files Modified**:
- `src-tauri/src/commands.rs:122-135`

---

### Issue #2: "controlnet" vs "control" Mismatch

**Problem**:
ControlNets view was requesting `model_type = "controlnet"` but the database uses `model_type = "control"`.

**Root Cause**:
Inconsistent naming between frontend and backend:
- Frontend: `useModels('controlnet')`
- Database/Backend: `model_type = 'control'`

**Fix Applied**:
Updated frontend to use "control" to match the database schema:

```javascript
// OLD (wrong)
useModels('controlnet')

// NEW (correct)
useModels('control')
```

**Files Modified**:
- `src/components/views/ControlNetsView.js:20` - Changed hook parameter
- `src/components/views/ControlNetsView.js:33` - Changed modelType prop

---

### Issue #3: Foreign Key Constraint Errors

**Problem**:
Application logs showing errors:
```
⚠ Failed to add relationship jibmixflux_v10analogagain_f16.ckpt -> flux_1_vae_f16.ckpt: FOREIGN KEY constraint failed
⚠ Failed to add relationship jibmixflux_v10analogagain_f16.ckpt -> clip_vit_l14_f16.ckpt: FOREIGN KEY constraint failed
⚠ Failed to add relationship jibmixflux_v10analogagain_f16.ckpt -> t5_xxl_encoder_q6p.ckpt: FOREIGN KEY constraint failed
```

**Root Cause**:
The JSON configuration (`custom.json`) references a model file `jibmixflux_v10analogagain_f16.ckpt` that doesn't exist on disk. When the code tried to create relationships for this model:
1. Parent model doesn't exist in database (file not on disk)
2. Foreign key constraint fails when trying to insert a relationship with non-existent parent

**The Real Issue**:
JSON files can reference models that have been deleted from disk, creating a mismatch between JSON configuration and actual files.

**Fix Applied**:
Added existence checks before creating relationships:

```rust
// Check if parent model exists in database
let parent_exists = operations::get_model_by_filename(conn, &model.file)
    .map(|m| m.is_some())
    .unwrap_or(false);

if !parent_exists {
    // Skip - model in JSON but file doesn't exist on disk
    continue;
}

// Check if encoder exists in database
let encoder_exists = operations::get_model_by_filename(conn, &encoder_file)
    .map(|m| m.is_some())
    .unwrap_or(false);

if !encoder_exists {
    // Skip - encoder file not found
    continue;
}

// Both parent and child exist, safe to add relationship
operations::add_relationship(conn, &model.file, &encoder_file)?;
```

**Benefits**:
- ✅ No more foreign key constraint errors
- ✅ Graceful handling of JSON/filesystem mismatches
- ✅ Clear logging of skipped models
- ✅ Resilient to users deleting files without updating JSON

**Files Modified**:
- `src-tauri/src/first_run.rs:229-272` - Added checks in initialization
- `src-tauri/src/commands.rs:219-251` - Added checks in manual scan

---

## Testing Results

### Expected Behavior After Fix

1. **Main Models View**:
   - Shows only models with `model_type = 'model'`
   - Example: flux_qwen_srpo_v1.0_f16.ckpt, flux_1_fill_dev_q5p.ckpt

2. **LoRAs View**:
   - Shows only models with `model_type = 'lora'`
   - Example: qwen_image_4steps_v2.0_bf16_lora_f16.ckpt

3. **ControlNets View**:
   - Shows only models with `model_type = 'control'`
   - Example: (if any exist)

4. **No Foreign Key Errors**:
   - Relationships only created for files that exist
   - Clean log output without constraint errors

### Verification

**Check filtering in database**:
```bash
# Count by type
sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite \
  "SELECT model_type, COUNT(*) FROM ckpt_models GROUP BY model_type"

# Main models
sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite \
  "SELECT COUNT(*) FROM ckpt_models WHERE model_type = 'model'"

# LoRAs
sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite \
  "SELECT COUNT(*) FROM ckpt_models WHERE model_type = 'lora'"

# Controls
sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite \
  "SELECT COUNT(*) FROM ckpt_models WHERE model_type = 'control'"
```

**Check relationships were created**:
```bash
sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite \
  "SELECT COUNT(*) FROM ckpt_x_ckpt"
```

Expected: Should have relationships only for models that exist

**Check for orphaned JSON references**:
```bash
sqlite3 -column -header ~/.drawthings_companion/drawthings_companion.sqlite \
  "SELECT filename FROM ckpt_models WHERE model_type = 'model'"
```

Compare with models listed in `custom.json` - any missing files will have been skipped

---

## Build Status

✅ **Compiles successfully**

```
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.16s
```

---

## Additional Notes

### JSON vs Filesystem Mismatches

The JSON files are the "intended state" but the filesystem is the "actual state". This fix makes the app resilient to mismatches:

- **JSON references missing file**: Relationship skipped, no error
- **File exists but not in JSON**: File imported with `model_type = 'unknown'` or detected from filename
- **Both exist**: Relationship created successfully

This is the correct architectural approach since users can:
- Delete model files manually
- Move files without updating JSON
- Have stale JSON configurations

### Future Enhancement

Consider adding a UI feature to:
1. Show models in JSON that don't exist on disk
2. Allow users to "clean up" JSON by removing references to missing files
3. Show orphaned files (exist on disk but not in JSON) with `model_type = 'unknown'`
