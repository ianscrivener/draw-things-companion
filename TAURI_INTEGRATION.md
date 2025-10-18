# Tauri Backend Integration

This document describes the Tauri backend integration setup for DrawThings Companion.

## Overview

The app now has full access to:
- **Shell commands**: bash, jq, mv, ls, cp, mkdir, xz, zip, rm, openssl, shasum
- **File system**: read, write, remove, rename, copy, exists, readDir
- **SQLite database**: For storing app data and metadata

## Configuration Files Updated

### 1. `src-tauri/Cargo.toml`
Added plugins:
```toml
tauri-plugin-shell = "2"
tauri-plugin-fs = "2"
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
```

### 2. `src-tauri/capabilities/default.json`
Added permissions:
- `shell:allow-execute`, `shell:allow-open`
- `fs:allow-read`, `fs:allow-write`, `fs:allow-remove`, `fs:allow-mkdir`, `fs:allow-rename`, `fs:allow-copy-file`, `fs:allow-exists`, `fs:allow-read-dir`
- `sql:allow-execute`, `sql:allow-select`, `sql:allow-load`

### 3. `src-tauri/tauri.conf.json`
Added shell command scopes in `plugins.shell.scope`:
```json
{
  "name": "bash",
  "cmd": "bash",
  "args": true
}
```
(Repeated for: jq, mv, ls, cp, mkdir, xz, zip, rm, openssl, shasum)

### 4. `src-tauri/src/lib.rs`
Registered plugins:
```rust
.plugin(tauri_plugin_shell::init())
.plugin(tauri_plugin_fs::init())
.plugin(tauri_plugin_sql::Builder::default().build())
```

## Frontend Integration

### Installed Packages
```bash
npm install @tauri-apps/api @tauri-apps/plugin-shell @tauri-apps/plugin-fs @tauri-apps/plugin-sql
```

### API Helper: `src/lib/tauri.js`

Provides convenient wrapper functions for all Tauri operations:

#### Shell Commands
```javascript
import {
  executeBash,
  listDirectory,
  moveFile,
  copyFile,
  makeDirectory,
  removeFile,
  executeOpenssl,
  calculateShasum,
  getFileSha256
} from '@/lib/tauri';

// Execute bash command
const result = await executeBash(['-c', 'echo "Hello"']);
console.log(result.stdout); // "Hello\n"

// List directory
const output = await listDirectory(['-la', '/path']);

// Move file
await moveFile('/source/file.txt', '/dest/file.txt');

// Copy file (recursive)
await copyFile('/source', '/dest', true);

// Create directory (with parents)
await makeDirectory('/path/to/dir', true);

// Remove file/directory
await removeFile('/path/to/remove', recursive: true, force: true);

// Calculate file checksum
const hash = await getFileSha256('/path/to/model.safetensors');
console.log(hash); // "a1b2c3d4..."

// Use shasum with different algorithm
const result = await calculateShasum('/path/file.txt', '512');

// Execute openssl command
const opensslResult = await executeOpenssl(['dgst', '-sha256', '/path/file.txt']);
```

#### File System Operations
```javascript
import {
  readTextFile,
  writeTextFile,
  readDir,
  exists,
  createDir,
  rename,
  copy
} from '@/lib/tauri';

// Read text file
const content = await readTextFile('/path/to/file.txt');

// Write text file
await writeTextFile('/path/to/file.txt', 'Hello, world!');

// Check if file exists
const fileExists = await exists('/path/to/file.txt');

// Read directory
const entries = await readDir('/path/to/dir');
entries.forEach(entry => {
  console.log(entry.name, entry.isDirectory);
});

// Create directory
await createDir('/path/to/new/dir', { recursive: true });

// Rename/move
await rename('/old/path.txt', '/new/path.txt');

// Copy file
await copy('/source.txt', '/destination.txt');
```

#### SQLite Database
```javascript
import { loadDatabase, executeQuery, executeStatement } from '@/lib/tauri';

// Load database
const db = await loadDatabase('/path/to/database.db');

// Select query
const results = await executeQuery(db, 'SELECT * FROM models WHERE id = ?', [1]);

// Insert/Update/Delete
await executeStatement(db, 'INSERT INTO models (name, path) VALUES (?, ?)', ['SDXL', '/path/to/model.safetensors']);
```

#### Helper Functions
```javascript
import { getDrawThingsPath, scanModelFiles } from '@/lib/tauri';

// Get DrawThings app directory
const dtPath = await getDrawThingsPath();
// Returns: ~/Library/Containers/com.liuliu.draw-things/Data/Documents

// Scan for model files
const models = await scanModelFiles('models');
const loras = await scanModelFiles('loras');
```

## Testing

A test component is available at `src/components/TauriTest.js`:

```javascript
import TauriTest from '@/components/TauriTest';

// In your page component:
<TauriTest />
```

This provides buttons to test:
- Shell command execution
- File system operations
- Model scanning

## Security Considerations

### Shell Command Scope
Only the commands listed in `tauri.conf.json` can be executed:
- bash, jq, mv, ls, cp, mkdir, xz, zip, rm, openssl, shasum

To add more commands, update the `plugins.shell.scope` array.

### File System Access
The app has full file system access. Consider adding path restrictions in production:

```json
"fs": {
  "scope": [
    "$HOME/Library/Containers/com.liuliu.draw-things/**",
    "$APPDATA/DrawThingsCompanion/**"
  ]
}
```

### Database Security
SQLite databases are accessed locally. Use prepared statements to prevent SQL injection.

## Development Workflow

### 1. Build and Test
```bash
# Terminal 1: Run Tauri in dev mode
npm run tauri dev

# The app will:
# - Start Next.js dev server on port 3000
# - Launch Tauri desktop window
# - Hot reload on file changes
```

### 2. Add New Rust Commands
Edit `src-tauri/src/lib.rs`:

```rust
#[tauri::command]
fn scan_models(path: &str) -> Result<Vec<String>, String> {
    // Your Rust logic here
    Ok(vec![])
}

// Register in run():
.invoke_handler(tauri::generate_handler![greet, scan_models])
```

Call from frontend:
```javascript
import { invoke } from '@tauri-apps/api/core';
const models = await invoke('scan_models', { path: '/models' });
```

### 3. Production Build
```bash
npm run tauri build
```

Outputs platform-specific binaries in `src-tauri/target/release/bundle/`

## Next Steps

1. **Implement Model Scanning**
   - Create Rust command to scan DrawThings directories
   - Parse model metadata (file size, type, etc.)
   - Return structured data to frontend

2. **Set Up Database**
   - Create SQLite schema for stashes, settings, metadata
   - Implement CRUD operations
   - Add migration system

3. **Build Stash Management**
   - Move models to external drives
   - Track stash locations
   - Restore models when needed

4. **Error Handling**
   - Add proper error handling in Rust commands
   - Show user-friendly errors in UI
   - Log errors for debugging

## Troubleshooting

### "Command not allowed"
Check that the command is in `tauri.conf.json` under `plugins.shell.scope`.

### "Permission denied"
Ensure permissions are added in `capabilities/default.json`.

### "Plugin not found"
Make sure plugin is:
1. Added to `Cargo.toml`
2. Initialized in `lib.rs`
3. Has corresponding npm package installed

### Build errors
```bash
# Clean and rebuild
cd src-tauri
cargo clean
cd ..
npm run tauri build
```
