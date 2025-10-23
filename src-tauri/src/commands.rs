use crate::db::{models::*, operations};
use crate::file_ops;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub dt_base_dir: Mutex<Option<PathBuf>>,
    pub stash_dir: Mutex<Option<PathBuf>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResult {
    pub scanned_count: usize,
    pub imported_count: usize,
    pub errors: Vec<String>,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct CopyProgress {
    pub current: usize,
    pub total: usize,
    pub current_file: String,
}

// Configuration commands
#[tauri::command]
pub fn get_config_value(key: String, state: State<AppState>) -> Result<Option<String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::get_config(&conn, &key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_config_value(key: String, value: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::set_config(&conn, &key, &value).map_err(|e| e.to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppPaths {
    pub dt_base_dir: String,
    pub stash_dir: Option<String>,
}

#[tauri::command]
pub fn get_app_paths(state: State<AppState>) -> Result<AppPaths, String> {
    let dt_base_dir = state
        .dt_base_dir
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| "~/Library/Containers/com.liuliu.draw-things/Data/Documents".to_string());

    let stash_dir = state
        .stash_dir
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .map(|p| p.to_string_lossy().to_string());

    Ok(AppPaths {
        dt_base_dir,
        stash_dir,
    })
}

#[tauri::command]
pub fn update_stash_dir(new_stash_dir: String, state: State<AppState>) -> Result<(), String> {
    // Update in-memory state
    *state.stash_dir.lock().map_err(|e| e.to_string())? = Some(PathBuf::from(&new_stash_dir));

    // Ensure directory exists
    file_ops::ensure_directory(&new_stash_dir).map_err(|e| e.to_string())?;

    // Update in database
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::set_config(&conn, "STASH_DIR", &new_stash_dir).map_err(|e| e.to_string())?;

    Ok(())
}

// Model query commands
#[tauri::command]
pub fn get_models(model_type: String, state: State<AppState>) -> Result<Vec<ModelWithMacInfo>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::get_models_by_type(&conn, &model_type).map_err(|e| e.to_string())
}

// Mac model commands
#[tauri::command]
pub fn add_model_to_mac(
    model_id: i64,
    display_order: i32,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let mac_model = MacModel {
        id: None,
        model_id,
        display_order,
        is_visible: true,
        custom_name: None,
        lora_strength: None,
    };
    
    operations::insert_mac_model(&conn, &mac_model).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn remove_model_from_mac(model_id: i64, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::delete_mac_model(&conn, model_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_models_order(
    updates: Vec<(i64, i32)>,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::update_mac_models_batch(&conn, updates).map_err(|e| e.to_string())
}

// File scanning and import commands
#[tauri::command]
pub fn scan_mac_models(model_type: String, state: State<AppState>) -> Result<ScanResult, String> {
    let dt_base_dir = state
        .dt_base_dir
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or("DT_BASE_DIR not configured")?;

    // All models are in the Models subdirectory
    let model_dir = dt_base_dir.join("Models");

    let extensions = file_ops::get_model_extensions(&model_type);
    let files = file_ops::scan_directory(&model_dir, &extensions)
        .map_err(|e| e.to_string())?;

    let mut imported_count = 0;
    let mut errors = Vec::new();
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    for file_path in &files {
        match import_model_file(&conn, file_path, &model_type) {
            Ok(_) => imported_count += 1,
            Err(e) => errors.push(format!("{}: {}", file_path.display(), e)),
        }
    }

    Ok(ScanResult {
        scanned_count: files.len(),
        imported_count,
        errors,
    })
}

#[tauri::command]
pub fn copy_model_to_stash(
    model_id: i64,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let stash_dir = state
        .stash_dir
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or("STASH_DIR not configured")?;

    // Get model info
    let model = operations::get_model_by_filename(&conn, "")
        .map_err(|e| e.to_string())?
        .ok_or("Model not found")?;

    // Build stash path (flat structure - all models in stash root)
    let stash_path = stash_dir.join(&model.filename);

    // Copy file (implementation would need source path from config)
    // This is a placeholder - actual implementation would track source paths
    
    // Record in stash_models table
    let stash_model = StashModel {
        id: None,
        model_id,
        stash_path: stash_path.to_string_lossy().to_string(),
        last_synced: None,
    };
    
    operations::insert_stash_model(&conn, &stash_model).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn initialize_app(
    dt_base_dir: String,
    stash_dir: String,
    state: State<AppState>,
) -> Result<(), String> {
    // Store paths
    *state.dt_base_dir.lock().map_err(|e| e.to_string())? = Some(PathBuf::from(&dt_base_dir));
    *state.stash_dir.lock().map_err(|e| e.to_string())? = Some(PathBuf::from(&stash_dir));

    // Ensure stash directory exists
    file_ops::ensure_directory(&stash_dir).map_err(|e| e.to_string())?;

    // Set config
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::set_config(&conn, "STASH_EXISTS", "true").map_err(|e| e.to_string())?;
    operations::set_config(&conn, "DT_BASE_DIR", &dt_base_dir).map_err(|e| e.to_string())?;
    operations::set_config(&conn, "STASH_DIR", &stash_dir).map_err(|e| e.to_string())?;

    Ok(())
}

// Helper function
fn import_model_file(
    conn: &Connection,
    file_path: &Path,
    model_type: &str,
) -> Result<i64, String> {
    let filename = file_path
        .file_name()
        .ok_or("Invalid filename")?
        .to_string_lossy()
        .to_string();

    // Check if already exists
    if let Some(existing) = operations::get_model_by_filename(conn, &filename)
        .map_err(|e| e.to_string())?
    {
        return Ok(existing.id.unwrap());
    }

    // Get file metadata
    let file_size = file_ops::get_file_size(file_path)
        .map_err(|e| e.to_string())?;
    let checksum = file_ops::calculate_checksum(file_path)
        .map_err(|e| e.to_string())?;

    // Create model record
    let model = Model {
        id: None,
        filename,
        display_name: None,
        model_type: model_type.to_string(),
        file_size: Some(file_size as i64),
        checksum: Some(checksum),
        created_at: None,
        updated_at: None,
    };

    operations::insert_model(conn, &model).map_err(|e| e.to_string())
}
