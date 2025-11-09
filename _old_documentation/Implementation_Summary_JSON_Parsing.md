# Implementation Summary: JSON Parsing & Model Relationships

**Date**: 2025-10-24
**Status**: ✅ Complete

## Overview

Implemented comprehensive JSON parsing for DrawThings configuration files and model relationship tracking. This addresses the critical gap where the system was using naive filename-based detection instead of reading DrawThings' JSON configuration files.

---

## What Was Implemented

### 1. JSON Parsing Module (`src-tauri/src/dt_json.rs`)

Created a new module that:

- **Parses DrawThings JSON files**:
  - `custom.json` - Main models with encoder relationships
  - `custom_lora.json` - LoRA models with strength values
  - `custom_controlnet.json` - ControlNet models

- **Data Structures**:
  - `CustomModel` - Deserializes main model entries
  - `CustomLora` - Deserializes LoRA entries with weight information
  - `CustomControlNet` - Deserializes ControlNet entries
  - `DrawThingsConfig` - Main configuration container with lookup maps

- **Lookup Maps for Efficient Queries**:
  - `file_to_model_name` - Maps filename → display name
  - `file_to_model_type` - Maps filename → model type (model, lora, control, clip, text, vae)
  - `file_to_display_order` - Maps filename → array position for display order
  - `file_to_lora_strength` - Maps filename → strength value × 10
  - `main_model_to_encoders` - Maps main model → list of encoder files

- **Helper Methods**:
  - `get_display_name()` - Retrieve user-friendly name from JSON
  - `get_model_type()` - Get accurate model type from JSON
  - `get_display_order()` - Get display order from JSON array position
  - `get_lora_strength()` - Get LoRA strength converted to integer
  - `get_model_encoders()` - Get all encoders used by a main model

### 2. Updated `scan_mac_models()` Function

Modified `src-tauri/src/commands.rs:181`:

**Before**:
- Scanned files and used naive filename detection
- No display names, incorrect model types
- No display order tracking
- No relationship data

**After**:
- Parses JSON configuration first
- Uses JSON data as source of truth
- Populates display names from JSON
- Sets correct model types based on JSON
- Uses array position for display order
- **Populates `ckpt_x_ckpt` relationship table**

### 3. Enhanced `import_model_file()` Function

Updated `src-tauri/src/commands.rs:377`:

**Improvements**:
- Accepts `DrawThingsConfig` parameter
- Uses JSON data to populate:
  - `display_name` - From JSON instead of None
  - `model_type` - From JSON instead of filename guessing
  - `mac_display_order` - From JSON array position
  - `lora_strength` - From JSON weight value
- Fallback to filename detection only if not in JSON
- Updates existing records with JSON metadata

### 4. Enabled Relationship Functions

Removed `#[allow(dead_code)]` from:
- `add_relationship()` - Now used to store main model → encoder relationships
- `get_relationships()` - Available for querying model dependencies

---

## How It Works

### Data Flow

```
1. scan_mac_models() called
   ↓
2. Parse JSON files from Models directory
   - custom.json
   - custom_lora.json
   - custom_controlnet.json
   ↓
3. Build lookup maps in DrawThingsConfig
   ↓
4. Scan filesystem for .ckpt files
   ↓
5. For each file:
   - Get metadata from JSON (display name, type, order, strength)
   - Fallback to filename detection if not in JSON
   - Insert/update in ckpt_models table
   ↓
6. For each main model in JSON:
   - Extract encoder references (clip_encoder, text_encoder, autoencoder)
   - Populate ckpt_x_ckpt relationship table
```

### Example: Main Model with Encoders

**JSON Entry** (`custom.json`):
```json
{
  "name": "Flux Qwen SRPO v1.0",
  "file": "flux_qwen_srpo_v1.0_f16.ckpt",
  "autoencoder": "flux_1_vae_f16.ckpt",
  "clip_encoder": "clip_vit_l14_f16.ckpt",
  "text_encoder": "t5_xxl_encoder_q6p.ckpt"
}
```

**Database Results**:

`ckpt_models` table:
- `flux_qwen_srpo_v1.0_f16.ckpt` - type: `model`, display_name: `Flux Qwen SRPO v1.0`
- `flux_1_vae_f16.ckpt` - type: `vae`
- `clip_vit_l14_f16.ckpt` - type: `clip`
- `t5_xxl_encoder_q6p.ckpt` - type: `text`

`ckpt_x_ckpt` table:
- parent: `flux_qwen_srpo_v1.0_f16.ckpt` → child: `flux_1_vae_f16.ckpt`
- parent: `flux_qwen_srpo_v1.0_f16.ckpt` → child: `clip_vit_l14_f16.ckpt`
- parent: `flux_qwen_srpo_v1.0_f16.ckpt` → child: `t5_xxl_encoder_q6p.ckpt`

### Example: LoRA with Strength

**JSON Entry** (`custom_lora.json`):
```json
{
  "name": "⭐️Qwen-Image-4steps-v2.0-bf16",
  "file": "qwen_image_4steps_v2.0_bf16_lora_f16.ckpt",
  "weight": {
    "value": 1.0
  }
}
```

**Database Result**:
- `filename`: `qwen_image_4steps_v2.0_bf16_lora_f16.ckpt`
- `display_name`: `⭐️Qwen-Image-4steps-v2.0-bf16`
- `model_type`: `lora`
- `lora_strength`: `10` (1.0 × 10)
- `mac_display_order`: `0` (first in array)

---

## Benefits

### 1. **Accurate Model Classification**
- No more guessing from filenames
- Types come from JSON source of truth
- Correctly identifies encoders as `clip`, `text`, `vae` not `model`

### 2. **User-Friendly Display Names**
- Shows names from DrawThings JSON instead of filenames
- Preserves special characters and formatting (⭐️ emoji, etc.)

### 3. **Correct Display Order**
- Matches DrawThings app order
- Uses JSON array position
- Mac HD models show in correct sequence

### 4. **LoRA Strength Tracking**
- Preserves user-configured strength values
- Stored as integer (value × 10) for precision

### 5. **Model Relationship Tracking**
- Know which encoders are used by which main models
- Can prevent deletion of shared encoders
- Can copy all required files together
- Foundation for dependency management

---

## Testing

Build successful with only minor warnings:
- ✅ Compiles without errors
- ⚠️ Warning: `get_relationships()` not yet used (future feature)
- ⚠️ Warning: Some fields not yet exposed (future features)

---

## Next Steps (Remaining from To-Do List)

### Priority 4: Add Stash Directory Scanning
- Implement `scan_stash_models()` function
- Support discovering models that only exist in stash
- Merge stash and Mac HD data correctly

### Priority 5: Implement Subdirectory Structure
- Create subdirectory structure on stash initialization
  - `Data/Clip_encoders/`
  - `Data/Controls/`
  - `Data/LoRAs/`
  - `Data/Main_models/`
  - `Data/Text_encoders/`
  - `Data/VAEs/`
- Update `copy_model_to_stash()` to route files by type
- Update scanning to search subdirectories

---

## Files Modified

1. **New**: `src-tauri/src/dt_json.rs` - JSON parsing module
2. **Modified**: `src-tauri/src/lib.rs` - Added dt_json module
3. **Modified**: `src-tauri/src/commands.rs` - Updated scan and import functions
4. **Modified**: `src-tauri/src/db/operations.rs` - Enabled relationship functions

---

## Architecture Notes

### JSON as Source of Truth

This implementation follows the architectural principle stated by the user:
> "The files and JSON are the source of truth. The SQLite DB reflects this for convenience."

The database now accurately mirrors the JSON configuration, making it a reliable cache for quick queries while respecting the JSON files as authoritative.

### Future Enhancements

With this foundation, the system can now:
- Detect when JSON files have changed (compare checksums)
- Refresh database from JSON on demand
- Show which models are orphaned (in filesystem but not in JSON)
- Warn before deleting shared encoders
- Copy entire model dependency chains
