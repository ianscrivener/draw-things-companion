# In-Memory Object & State Management

This document describes the in-memory JavaScript object that replaces the SQLite database for storing application data.

## Overview

DrawThings Companion uses a **reactive in-memory object** instead of a traditional database. All checkpoint data, settings, and application state are stored in a global Svelte 5 `$state` object located at `src-svelte/src/appState.svelte.js`.

## Why In-Memory Storage?

- **Performance**: No database queries, instant access to all data
- **Simplicity**: No SQL schema migrations, no ORM complexity
- **Reactivity**: Svelte 5's `$state` rune provides automatic UI updates
- **Desktop-first**: Perfect for single-user desktop applications

## Structure

```javascript
appState = {
  // Organized models from DrawThings JSON files
  mac: {
    models: [],    // Array of model objects
    loras: [],     // Array of LoRA objects
    controls: []   // Array of ControlNet objects
  },

  stash: {
    models: [],
    loras: [],
    controls: []
  },

  // Raw filesystem listings
  ckpts: {
    mac: [],       // [{ckpt_filename, file_size, file_date}, ...]
    stash: []
  },

  // Trash/deleted items
  stash_trash: {
    models: [],
    loras: [],
    controls: []
  },

  // Application settings
  settings: {
    DT_BASE_DIR: '',
    STASH_DIR: '',
    DTC_APP_DIR: '',
    initialized: false,
    initialized_date: null,
    GITHUB_OWNER: '',
    GITHUB_REPO: '',
    PARQUET_METADATA_URL: ''
  }
}
```

## Model Object Schema

Each model/lora/control object contains fields from the previous database schema:

```javascript
{
  filename: 'model_name.ckpt',
  display_name_original: 'Original Name',  // From DrawThings JSON
  display_name: 'Custom Name',             // User's editable name
  model_type: 'model',                     // model|lora|control
  file_size: 1234567890,
  checksum: null,
  source_path: '/path/to/file',

  // Location tracking
  exists_mac_hd: true,
  exists_stash: false,

  // Display ordering (Mac only, Stash is alphabetical)
  mac_display_order: 0,

  // LoRA specific
  lora_strength: 75,  // value × 10 (e.g., 75 = 7.5 strength)

  // Timestamps
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z'
}
```

## Svelte 5 $state Rune

The `$state` rune makes the object **deeply reactive**:

```javascript
export const appState = $state({
  mac: { models: [], loras: [], controls: [] },
  // ...
});
```

### What This Means

- **Automatic UI Updates**: When any property changes, Svelte automatically re-renders components that use that data
- **Deep Reactivity**: Changes to nested properties (e.g., `appState.mac.models[0].display_name`) trigger updates
- **No Manual Tracking**: No need for `setState()`, `dispatch()`, or manual re-renders

### Example Usage in Components

```svelte
<script>
  import { appState } from './appState.svelte.js';

  // Reactive - UI updates automatically when appState.mac.models changes
  $: modelCount = appState.mac.models.length;
</script>

<p>You have {modelCount} models on Mac HD</p>

{#each appState.mac.models as model}
  <div>{model.display_name}</div>
{/each}
```

## Helper Functions

The `appState.svelte.js` file includes helper functions for common operations:

### `findCkpt(filename)`
Searches across all locations for a checkpoint by filename.

```javascript
const ckpt = findCkpt('my_model.ckpt');
```

### `getCkptsByTypeAndLocation(location, type)`
Gets all checkpoints of a specific type at a location.

```javascript
const macModels = getCkptsByTypeAndLocation('mac', 'model');
```

### `upsertCkpt(location, type, ckptData)`
Adds or updates a checkpoint in the state.

```javascript
upsertCkpt('mac', 'model', {
  filename: 'new_model.ckpt',
  display_name: 'My New Model',
  model_type: 'model',
  // ...
});
```

### `removeCkpt(location, type, filename)`
Removes a checkpoint from the state.

```javascript
removeCkpt('mac', 'model', 'old_model.ckpt');
```

## Direct Mutations

All library functions (`src-svelte/src/lib/`) directly mutate the `appState` object:

```javascript
import { appState } from '../../appState.svelte.js';

export async function some_function() {
  // Direct mutation - Svelte automatically detects and triggers updates
  appState.mac.models.push(newModel);

  // Or using helpers
  upsertCkpt('mac', 'model', newModel);
}
```

## Persistence

The in-memory object is **not** persisted to disk. Data is loaded fresh on startup:

1. **Settings**: Loaded from `~/.drawthings_companion/settings.json`
2. **Models**: Scanned from DrawThings JSON files on each startup
3. **Filesystem Data**: Scanned from Models directories on demand

To persist changes:
- Settings: Use `write_settings()`
- Model configurations: Use `write_json()` (writes to DrawThings JSON files)
- File operations: Use `copy_ckpt()`, `delete_ckpt()`, etc.

## Parent-Child Relationships

Instead of a `ckpt_x_ckpt` junction table, we use **in-memory lookups**:

- **Children**: Parse model object properties (vae, clip_encoder, text_encoder, etc.)
- **Parents**: Search all models for references to a filename

Functions:
- `get_children(filename)` - Returns array of child filenames
- `get_parents(filename)` - Returns array of parent model filenames

This is fast enough for in-memory operations (typically < 1000 models).

## Benefits

✅ **Faster**: No database I/O overhead
✅ **Simpler**: No SQL, no migrations, no schema management
✅ **Reactive**: UI updates automatically via Svelte $state
✅ **Debuggable**: Inspect entire state in browser devtools
✅ **Flexible**: Easy to add new fields without schema changes

## Trade-offs

⚠️ **No Persistence**: Data must be reloaded on startup
⚠️ **Memory Usage**: All data in RAM (typically 1-10 MB for most users)
⚠️ **No Transactions**: No ACID guarantees (not needed for desktop app)
⚠️ **Single User**: Not suitable for multi-user scenarios (by design)

## Loading Data on Startup

A typical startup sequence:

```javascript
import { app_init } from './lib/init/app_init.js';
import { read_json } from './lib/data/read_json.js';
import { read_ckpts } from './lib/ckpt_ls/read_ckpts.js';

// 1. Initialize app (creates directories, loads settings)
await app_init();

// 2. Load DrawThings models from JSON
const macModels = await read_json('mac', 'model');
const macLoras = await read_json('mac', 'lora');
const macControls = await read_json('mac', 'control');

// 3. Scan filesystem for all .ckpt files
const macCkpts = await read_ckpts('mac');

// 4. Populate appState (functions do this automatically)
// appState is now fully loaded and reactive
```

## See Also

- `src-svelte/src/appState.svelte.js` - The actual implementation
- `functions_datasets_app_state.md` - Function reference
- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/$state)
