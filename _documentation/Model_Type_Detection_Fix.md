# Model Type Detection Fix

**Date**: 2025-10-24
**Status**: ✅ Fixed - Requires Database Rebuild

## Problem

Models not found in the JSON configuration files were being incorrectly classified with `model_type = 'model'` instead of more appropriate types.

**Examples of misclassification**:
- `qwen_image_vae_f16.ckpt` → classified as `model` (should be `vae`)
- `realesrgan_x2plus_f16.ckpt` → classified as `model` (should be `upscaler`)
- `restoreformer_v1.0_f16.ckpt` → classified as `model` (should be `face_restorer`)
- `clip_vit_l14_vision_model_f16.ckpt` → classified as `model` (should be `clip`)
- `qwen_2.5_vl_7b_vit_f16.ckpt` → classified as `model` (should be `clip`)
- `qwen_2.5_vl_7b_q8p.ckpt` → classified as `model` (should be `unknown`)

## Root Cause

The fallback `detect_model_type()` function had two issues:

1. **Incomplete pattern matching** - Didn't check for:
   - Vision Transformers (`vit`, `vision_model`) → CLIP encoders
   - T5 models → text encoders
   - ESRGAN models (`esrgan`, `realesrgan`) → upscalers
   - Face restoration models (`restoreformer`, `gfpgan`)

2. **Default to "model"** - Files that didn't match any pattern defaulted to `model` type instead of `unknown`

## Solution

### Enhanced Pattern Detection

Updated both `commands.rs` and `first_run.rs` to detect:

```rust
// CLIP encoders (including vision transformers)
if lower.contains("clip") || lower.contains("vit") || lower.contains("vision_model") {
    "clip".to_string()
}

// Text encoders (now includes T5)
else if lower.contains("text_encoder") || lower.contains("t5") {
    "text".to_string()
}

// VAE / Autoencoders
else if lower.contains("vae") || lower.contains("autoencoder") {
    "vae".to_string()
}

// Face restoration models
else if lower.contains("face") || lower.contains("gfpgan") || lower.contains("restoreformer") {
    "face_restorer".to_string()
}

// Upscaler models
else if lower.contains("upscale") || lower.contains("esrgan") || lower.contains("realesrgan") {
    "upscaler".to_string()
}

// Unknown (not in JSON, doesn't match patterns)
else {
    "unknown".to_string()
}
```

## Model Type Detection Priority

As per the architectural documentation, classification follows this hierarchy:

1. **Found in `custom_lora.json`** → `lora`
2. **Found in `custom_controlnet.json`** → `control`
3. **Found as main `file` in `custom.json`** → `model`
4. **Found as `clip_encoder` in `custom.json`** → `clip`
5. **Found as `text_encoder` in `custom.json`** → `text`
6. **Found as `autoencoder` in `custom.json`** → `vae`
7. **Pattern match in filename**:
   - Contains "lora" → `lora`
   - Contains "control" → `control`
   - Contains "clip", "vit", "vision_model" → `clip`
   - Contains "text_encoder", "t5" → `text`
   - Contains "vae", "autoencoder" → `vae`
   - Contains "esrgan", "realesrgan", "upscale" → `upscaler`
   - Contains "face", "gfpgan", "restoreformer" → `face_restorer`
8. **Otherwise** → `unknown`

## Expected Results After Fix

After rebuilding the database, models will be correctly classified:

| Filename | Old Type | New Type |
|----------|----------|----------|
| `qwen_image_vae_f16.ckpt` | model | **vae** |
| `realesrgan_x2plus_f16.ckpt` | model | **upscaler** |
| `restoreformer_v1.0_f16.ckpt` | model | **face_restorer** |
| `clip_vit_l14_vision_model_f16.ckpt` | model | **clip** |
| `qwen_2.5_vl_7b_vit_f16.ckpt` | model | **clip** |
| `qwen_2.5_vl_7b_q8p.ckpt` | model | **unknown** |
| `qwen_image_1.0_q6p.ckpt` | model | **unknown** |
| `qwen_image_edit_2509_bf16_q6p.ckpt` | model | **unknown** |

## Files Modified

1. **`src-tauri/src/commands.rs`**:
   - Enhanced `detect_model_type()` function
   - Added patterns for vit, vision_model, t5, esrgan, restoreformer
   - Changed default from "model" to "unknown"

2. **`src-tauri/src/first_run.rs`**:
   - Enhanced `determine_model_type()` function
   - Same improvements as commands.rs
   - Removed incorrect logic that classified VAE and CLIP as "model"

## Testing Instructions

Since the detection logic has changed, you need to rebuild the database:

1. **Delete the current database**:
   ```bash
   rm ~/.drawthings_companion/drawthings_companion.sqlite
   ```

2. **Restart the app** (the new code will classify models correctly)

3. **Verify correct classification**:
   ```bash
   sqlite3 ~/.drawthings_companion/drawthings_companion.sqlite \
     "SELECT model_type, COUNT(*) FROM ckpt_models GROUP BY model_type ORDER BY COUNT(*) DESC"
   ```

   Expected output should include:
   - Multiple `vae` models (not just 1)
   - `upscaler` type (for ESRGAN models)
   - `face_restorer` type (for restoration models)
   - `clip` type (for vision models)
   - `unknown` type (for files not in JSON)

4. **Check specific models**:
   ```bash
   sqlite3 -column -header ~/.drawthings_companion/drawthings_companion.sqlite \
     "SELECT filename, model_type FROM ckpt_models
      WHERE filename IN (
        'qwen_image_vae_f16.ckpt',
        'realesrgan_x2plus_f16.ckpt',
        'restoreformer_v1.0_f16.ckpt',
        'clip_vit_l14_vision_model_f16.ckpt',
        'qwen_2.5_vl_7b_vit_f16.ckpt'
      )"
   ```

   Expected:
   ```
   filename                            model_type
   ----------------------------------  --------------
   qwen_image_vae_f16.ckpt             vae
   realesrgan_x2plus_f16.ckpt          upscaler
   restoreformer_v1.0_f16.ckpt         face_restorer
   clip_vit_l14_vision_model_f16.ckpt  clip
   qwen_2.5_vl_7b_vit_f16.ckpt         clip
   ```

## Still Missing: settings.json Support

**Note**: We're still not reading `settings.json` to identify face_restorer and upscaler models. Currently relying on filename pattern matching.

To fully implement the specification:
- Parse `/settings.json` (located in DT_BASE_DIR)
- Extract face restoration and upscaler model references
- Use those to definitively classify those model types

This is a future enhancement (Priority 6).

## Build Status

✅ **Compiles successfully**

```
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.14s
```
