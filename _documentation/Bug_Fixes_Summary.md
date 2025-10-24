# Bug Fixes Summary

**Date**: 2025-10-24
**Status**: ✅ Fixed and Ready for Testing

## Bugs Fixed

### Bug #1: Incorrect Stash Models in Database ✅

**Problem**:
When the app reloaded after deleting the SQLite database, it incorrectly recorded models in the stash hard drive.

**Root Cause**:
The `first_run.rs` file had its own separate `import_model_file()` function (line 264) that:
- Used old filename-based model type detection instead of JSON parsing
- Didn't populate display names, LoRA strengths, or correct model types
- Wasn't using the `DrawThingsConfig` at all

**Fix Applied**:
1. Updated `first_run.rs` to import and use `DrawThingsConfig`
2. Modified `scan_and_import_models()` to parse JSON before scanning:
   ```rust
   let dt_config = DrawThingsConfig::parse_from_directory(&dt_models_dir)?;
   ```
3. Updated `scan_directory_and_import()` to accept `dt_config` and `from_mac_hd` parameters
4. Completely rewrote `import_model_file()` to use JSON data just like `commands.rs`:
   - Gets display names from JSON
   - Gets model types from JSON (with fallback to filename detection)
   - Gets LoRA strength from JSON
   - Gets display order from JSON (for Mac HD models)
   - Correctly sets `exists_mac_hd` or `exists_stash` based on `from_mac_hd` parameter

**Result**:
- Mac HD models now correctly marked with `exists_mac_hd = true`
- Stash models now correctly marked with `exists_stash = true`
- Both locations get accurate metadata from JSON

---

### Bug #2: ckpt_x_ckpt Table Not Populating ✅

**Problem**:
The relationship table `ckpt_x_ckpt` wasn't being populated with main model → encoder relationships.

**Root Cause**:
The relationship population code was only in `commands.rs::scan_mac_models()` (which is manually triggered), but NOT in the `first_run.rs` initialization flow that runs on app startup.

**Fix Applied**:
Added relationship population to `scan_and_import_models()` in `first_run.rs`:

```rust
// Populate model relationships from JSON
logger::log_info(app, "Populating model relationships...".to_string());
let mut relationships_added = 0;
for model in &dt_config.models {
    if let Some(encoders) = dt_config.get_model_encoders(&model.file) {
        for encoder_file in encoders {
            if let Err(e) = operations::add_relationship(conn, &model.file, &encoder_file) {
                logger::log_warning(app, format!("Failed to add relationship {} -> {}: {}",
                    model.file, encoder_file, e));
            } else {
                relationships_added += 1;
            }
        }
    }
}
logger::log_success(app, format!("✓ Added {} model relationships", relationships_added));
```

**Result**:
- `ckpt_x_ckpt` table now populated during initialization
- Each main model linked to its CLIP encoder, text encoder, and VAE
- Logged count of relationships added for verification

---

## Files Modified

1. **`src-tauri/src/first_run.rs`**:
   - Added `use crate::dt_json::DrawThingsConfig;`
   - Updated `scan_and_import_models()` to parse JSON and populate relationships
   - Updated `scan_directory_and_import()` signature to accept `dt_config` and `from_mac_hd`
   - Completely rewrote `import_model_file()` to use JSON data

---

## Expected Behavior After Fix

### On Fresh Database Load:

1. **Initialization Log Output**:
   ```
   Starting initialization process...
   ✓ DTC_APP_DIR exists (database initialized)
   ✓ STASH_DIR exists: /Volumes/Extreme2Tb/__DrawThings_Stash__
   ✓ STASH_DIR/Models exists: /Volumes/Extreme2Tb/__DrawThings_Stash__/Models
   Syncing models with DrawThings directory...
   Copying JSON config files...
   ✓ Copied X JSON config files
   Syncing model files from Mac HD...
   ✓ Copied X model files
   Scanning models from Mac HD and Stash...
   Parsing DrawThings JSON configuration files...
   ✓ Parsed 5 main models, 14 LoRAs, 0 ControlNets from JSON
   Scanning Mac HD: ~/Library/Containers/com.liuliu.draw-things/Data/Documents/Models
     Imported X models from Mac HD
   Scanning Stash: /Volumes/Extreme2Tb/__DrawThings_Stash__/Models
     Imported X models from Stash
   Populating model relationships...
   ✓ Added 15 model relationships
   ✓ Imported X models into database
   ✓ All processing completed
   ```

2. **Database Verification**:

   Check Mac HD models:
   ```sql
   SELECT filename, display_name, model_type, exists_mac_hd, exists_stash, mac_display_order
   FROM ckpt_models
   WHERE exists_mac_hd = 1
   ORDER BY mac_display_order;
   ```

   Expected: Models from DrawThings JSON with correct display names and types

   Check Stash-only models:
   ```sql
   SELECT filename, display_name, model_type, exists_mac_hd, exists_stash
   FROM ckpt_models
   WHERE exists_stash = 1 AND exists_mac_hd = 0;
   ```

   Expected: Models only in stash, correctly marked

   Check relationships:
   ```sql
   SELECT
       p.display_name as main_model,
       c.filename as encoder_file,
       c.model_type as encoder_type
   FROM ckpt_x_ckpt r
   JOIN ckpt_models p ON r.parent_ckpt_filename = p.filename
   JOIN ckpt_models c ON r.child_ckpt_filename = c.filename
   ORDER BY p.display_name;
   ```

   Expected: Each main model linked to its clip_encoder, text_encoder, and autoencoder

3. **Example Relationships**:
   ```
   Main Model: "Flux Qwen SRPO v1.0"
   → flux_1_vae_f16.ckpt (type: vae)
   → clip_vit_l14_f16.ckpt (type: clip)
   → t5_xxl_encoder_q6p.ckpt (type: text)

   Main Model: "FLUX.1 Fill [dev] (5-bit)"
   → flux_1_vae_f16.ckpt (type: vae)
   → clip_vit_l14_f16.ckpt (type: clip)
   → t5_xxl_encoder_q6p.ckpt (type: text)
   ```

---

## Testing Instructions

1. **Delete the database**:
   ```bash
   rm ~/.drawthings_companion/drawthings_companion.sqlite
   ```

2. **Delete stash models** (optional, to test fresh copy):
   ```bash
   rm /Volumes/Extreme2Tb/__DrawThings_Stash__/Models/*.ckpt
   ```

3. **Restart the app**

4. **Check initialization logs** in the app UI

5. **Verify database contents**:
   ```bash
   sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite
   ```

   Then run:
   ```sql
   -- Count models by location
   SELECT
       COUNT(*) as total,
       SUM(exists_mac_hd) as mac_hd_count,
       SUM(exists_stash) as stash_count
   FROM ckpt_models;

   -- Count relationships
   SELECT COUNT(*) as relationship_count FROM ckpt_x_ckpt;

   -- Check main models have display names
   SELECT filename, display_name, model_type
   FROM ckpt_models
   WHERE model_type = 'model';

   -- Check LoRAs have strength values
   SELECT filename, display_name, lora_strength
   FROM ckpt_models
   WHERE model_type = 'lora';
   ```

6. **Expected Results**:
   - All Mac HD models have `exists_mac_hd = 1`
   - All Stash models have `exists_stash = 1`
   - Models in both locations have both flags set to 1
   - Main models have display names from JSON (not NULL)
   - LoRAs have display names and strength values
   - `ckpt_x_ckpt` table has ~15 relationships (3 per main model × 5 main models)
   - All encoders correctly typed as `clip`, `text`, or `vae` (not `model`)

---

## Build Status

✅ **Compiles successfully** with only minor warnings about unused helper functions (reserved for future features)

```
Finished `dev` profile [unoptimized + debuginfo] target(s) in 4.39s
```

---

## Next Steps

After successful testing, consider:
1. Adding UI to display model relationships
2. Preventing deletion of shared encoders
3. Auto-copying dependencies when copying main models
4. Implementing stash subdirectory structure (Priority 5 from To-Do list)
