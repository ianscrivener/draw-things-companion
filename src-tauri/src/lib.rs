use serde::{Deserialize, Serialize};
use serde_json;
use std::fs;
use std::time::SystemTime;

// ################################################################################
// # File Metadata Function
#[derive(Serialize, Deserialize)]
struct FileMetadata {
    exists: bool,
    size: Option<u64>,
    created: Option<String>,
    modified: Option<String>,
    error: Option<String>,
}

// ################################################################################
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum MetaResult {
    Object(FileMetadata),
    String(String),
}

// ################################################################################
// A function that takes a single filepath as an arguments and; (1) checks the files exists, returns array of filesize, create datetime, update datetime
#[tauri::command]
fn meta(filepath: &str, stringify: Option<bool>) -> MetaResult {
    let should_stringify = stringify.unwrap_or(false);

    let metadata_result = match fs::metadata(filepath) {
        Ok(metadata) => {
            let size = metadata.len();

            let created = metadata
                .created()
                .ok()
                .and_then(|time| time.duration_since(SystemTime::UNIX_EPOCH).ok())
                .map(|duration| duration.as_secs())
                .map(|secs| {
                    let datetime = chrono::DateTime::from_timestamp(secs as i64, 0);
                    datetime
                        .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                        .unwrap_or_else(|| "Invalid timestamp".to_string())
                });

            let modified = metadata
                .modified()
                .ok()
                .and_then(|time| time.duration_since(SystemTime::UNIX_EPOCH).ok())
                .map(|duration| duration.as_secs())
                .map(|secs| {
                    let datetime = chrono::DateTime::from_timestamp(secs as i64, 0);
                    datetime
                        .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                        .unwrap_or_else(|| "Invalid timestamp".to_string())
                });

            FileMetadata {
                exists: true,
                size: Some(size),
                created,
                modified,
                error: None,
            }
        }
        Err(e) => FileMetadata {
            exists: false,
            size: None,
            created: None,
            modified: None,
            error: Some(e.to_string()),
        },
    };

    if should_stringify {
        let json_string = serde_json::to_string(&metadata_result)
            .unwrap_or_else(|_| "Error serializing metadata".to_string());
        MetaResult::String(json_string)
    } else {
        MetaResult::Object(metadata_result)
    }
}


// ################################################################################
// # Tauri App Entry Point
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![meta])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
