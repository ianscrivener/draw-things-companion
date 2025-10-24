# GitHub Model Types Implementation

**Date**: 2025-10-24
**Status**: 🚧 In Progress - Need User Input

## Overview

Implementing support for `github_model_types` in settings.json to download authoritative lists of models, LoRAs, and ControlNets from GitHub.

## Implementation Created

### New Module: `github_model_types.rs`

Created a new module to handle:
1. Parsing `github_model_types` from settings.json
2. Downloading text files from GitHub URLs
3. Building a registry of known model filenames by type
4. Providing lookup functions for model type detection

### Key Features

```rust
pub struct GithubModelTypes {
    pub models_url: Option<String>,
    pub loras_url: Option<String>,
    pub controlnets_url: Option<String>,
}

pub struct ModelTypeRegistry {
    pub main_models: HashSet<String>,
    pub loras: HashSet<String>,
    pub controlnets: HashSet<String>,
}
```

**Functions**:
- `ModelTypeRegistry::load_from_github()` - Download and parse all three lists
- `registry.get_model_type(filename)` - Return model type for a filename
- `parse_github_model_types(path)` - Parse settings.json for URLs

### Dependencies Added

Added to `Cargo.toml`:
- `reqwest = "0.11"` - For HTTP downloads
- `tokio = "1"` - For async runtime

## ⚠️ User Input Needed

To complete this implementation, I need the following information:

### 1. Location of settings.json

Please provide the full path to `settings.json`. For example:
```
~/Library/Containers/com.liuliu.draw-things/Data/Documents/settings.json
```

Or if it's in a different location, please share the path.

### 2. Structure of github_model_types

Please share what the `github_model_types` object looks like in the settings file. For example:

```json
{
  "github_model_types": {
    "models_url": "https://raw.githubusercontent.com/...",
    "loras_url": "https://raw.githubusercontent.com/...",
    "controlnets_url": "https://raw.githubusercontent.com/..."
  }
}
```

### 3. Format of the Text Files

What format are the text files in? For example:
- One filename per line?
- JSON array?
- CSV?

Example:
```
flux_1_dev.ckpt
flux_1_schnell.ckpt
...
```

## Integration Plan

Once I have the above information, I will:

1. **Parse settings.json** on app startup
2. **Download model type lists** from GitHub (with caching)
3. **Enhance model type detection** to use this authoritative data:
   - First check GitHub registry
   - Then check custom JSON files
   - Finally fall back to filename patterns

### Detection Priority (Updated)

```
1. Check GitHub model type registry (authoritative)
2. Check custom.json (user's active models)
3. Check custom_lora.json (user's active LoRAs)
4. Check custom_controlnet.json (user's active ControlNets)
5. Pattern match filename
6. Mark as 'unknown'
```

## Benefits

✅ **Authoritative source** - GitHub lists are the definitive model types
✅ **Auto-updating** - Can download latest lists on startup or periodically
✅ **Comprehensive** - Covers all known models, not just what's in JSON
✅ **Accurate** - Eliminates guesswork from filename patterns
✅ **Fallback-friendly** - Still works if GitHub is unavailable

## Example Usage

```rust
// On app startup
let github_config = parse_github_model_types("/path/to/settings.json")?;
let registry = ModelTypeRegistry::load_from_github(&github_config).await?;

// During model import
if let Some(model_type) = registry.get_model_type("flux_1_dev.ckpt") {
    println!("Model type: {}", model_type); // "model"
} else {
    // Fall back to JSON or pattern detection
}
```

## Caching Strategy

To avoid downloading on every startup:
1. **Cache downloaded lists** in `~/.drawthings_companion/github_cache/`
2. **Check cache age** - redownload if older than 24 hours
3. **Fallback to cache** if GitHub is unreachable
4. **Manual refresh** button in UI

## Next Steps

**Waiting for user input on**:
1. ✋ Location of settings.json
2. ✋ Structure of github_model_types object
3. ✋ Format of the text files

**Once received**:
1. ✅ Complete settings parser
2. ✅ Test downloads
3. ✅ Integrate into model type detection
4. ✅ Add caching
5. ✅ Update UI

## Files Created

- `src-tauri/src/github_model_types.rs` - New module (awaiting completion)
- `src-tauri/Cargo.toml` - Added reqwest and tokio dependencies

## Files to Modify

- `src-tauri/src/lib.rs` - Add module import
- `src-tauri/src/commands.rs` - Integrate into model detection
- `src-tauri/src/first_run.rs` - Integrate into initialization
- `src-tauri/src/dt_json.rs` - Use as additional source of truth
