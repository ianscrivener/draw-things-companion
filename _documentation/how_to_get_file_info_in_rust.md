
# Tauri & Javascript frontend to get file info


### Rust code
```rust
// src-tauri/src/main.rs
#[tauri::command]
fn get_file_info(path: String) -> Result<(u64, i64, i64), String> {
    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    Ok((
        meta.len(),                    // size in bytes
        meta.mtime(),                  // modified (seconds)
        meta.st_birthtime(),           // created (seconds) - macOS specific!
    ))
}
```

### Javascript code
```js
// Frontend JS
const [size, modified, created] = await invoke('get_file_info', { path });

// Convert to JS dates:
const modifiedDate = new Date(modified * 1000);
const createdDate = new Date(created * 1000);
```