use crate::db::{models::*, operations};
use crate::dt_json::DrawThingsConfig;
use crate::file_ops;
use crate::logger::{LogEvent, LogStore};
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
pub struct InitializationStatus {
    pub status: String, // "not_started", "in_progress", "complete", "error"
    pub stash_exists: bool,
}

#[tauri::command]
pub fn get_initialization_status(state: State<AppState>) -> Result<InitializationStatus, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let status = operations::get_config(&conn, "INIT_STATUS")
        .map_err(|e| e.to_string())?
        .unwrap_or_else(|| "not_started".to_string());
    
    let stash_exists = operations::get_config(&conn, "STASH_EXISTS")
        .map_err(|e| e.to_string())?
        .map(|v| v == "true")
        .unwrap_or(false);
    
    Ok(InitializationStatus {
        status,
        stash_exists,
    })
}

#[tauri::command]
pub fn get_all_logs(log_store: State<LogStore>) -> Result<Vec<LogEvent>, String> {
    let logs = log_store.logs.lock().map_err(|e| e.to_string())?;
    Ok(logs.clone())
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

// Mac model commands
#[tauri::command]
pub fn add_model_to_mac(
    model_id: String,
    display_order: i32,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // model_id is actually the filename (primary key)
    operations::update_mac_hd_status(&conn, &model_id, true, Some(display_order))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_model_from_mac(model_id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // model_id is actually the filename (primary key)
    operations::update_mac_hd_status(&conn, &model_id, false, None)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_models_order(
    updates: Vec<(String, i32)>,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::update_display_orders(&conn, &updates).map_err(|e| e.to_string())
}

#[allow(dead_code)]
#[tauri::command]
pub fn update_model_name(
    filename: String,
    display_name: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::update_model_display_name(&conn, &filename, &display_name)
        .map_err(|e| e.to_string())
}

#[allow(dead_code)]
#[tauri::command]
pub fn update_model_lora_strength(
    filename: String,
    strength: i32,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    operations::update_lora_strength(&conn, &filename, strength)
        .map_err(|e| e.to_string())
}

// File scanning and import commands
#[tauri::command]
pub fn scan_mac_models(state: State<AppState>) -> Result<ScanResult, String> {
    let dt_base_dir = state
        .dt_base_dir
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or("DT_BASE_DIR not configured")?;

    let model_dir = dt_base_dir.join("Models");

    // Parse DrawThings JSON configuration files
    let dt_config = DrawThingsConfig::parse_from_directory(&model_dir)?;

    let extensions = vec!["ckpt", "safetensors", "pth", "pt"];
    let files = file_ops::scan_directory(&model_dir, &extensions)
        .map_err(|e| e.to_string())?;

    let mut imported_count = 0;
    let mut errors = Vec::new();
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    for file_path in &files {
        match import_model_file(&conn, file_path, true, &dt_config) {
            Ok(_) => imported_count += 1,
            Err(e) => errors.push(format!("{}: {}", file_path.display(), e)),
        }
    }

    // Now populate relationships for main models
    // Only add relationships for files that actually exist in the database
    for model in &dt_config.models {
        // Check if parent model exists in database
        let parent_exists = operations::get_model_by_filename(&conn, &model.file)
            .map(|m| m.is_some())
            .unwrap_or(false);

        if !parent_exists {
            // Skip - model in JSON but file doesn't exist on disk
            continue;
        }

        if let Some(encoders) = dt_config.get_model_encoders(&model.file) {
            for encoder_file in encoders {
                // Check if encoder exists in database
                let encoder_exists = operations::get_model_by_filename(&conn, &encoder_file)
                    .map(|m| m.is_some())
                    .unwrap_or(false);

                if !encoder_exists {
                    // Skip silently - encoder file not found
                    continue;
                }

                // Both parent and child exist, add relationship
                if let Err(e) = operations::add_relationship(&conn, &model.file, &encoder_file) {
                    errors.push(format!("Failed to add relationship {} -> {}: {}",
                        model.file, encoder_file, e));
                }
            }
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
    filename: String,
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
    let model = operations::get_model_by_filename(&conn, &filename)
        .map_err(|e| e.to_string())?
        .ok_or("Model not found")?;

    // Verify source_path exists
    let source_path = model.source_path
        .as_ref()
        .ok_or("Model has no source path stored")?;

    let source_path_buf = PathBuf::from(source_path);
    if !source_path_buf.exists() {
        return Err(format!("Source file not found: {}", source_path));
    }

    // Build stash path
    let stash_path = stash_dir.join(&model.filename);

    // Check if file already exists in stash
    if stash_path.exists() {
        return Err(format!("File already exists in stash: {}", model.filename));
    }

    // Check if there's enough disk space
    if let Some(file_size) = model.file_size {
        let has_space = file_ops::has_enough_space(&stash_dir, file_size as u64)
            .map_err(|e| format!("Failed to check disk space: {}", e))?;

        if !has_space {
            let available = file_ops::get_available_space(&stash_dir)
                .map_err(|e| format!("Failed to get available space: {}", e))?;
            let gb_available = available as f64 / (1024.0 * 1024.0 * 1024.0);
            let gb_required = file_size as f64 / (1024.0 * 1024.0 * 1024.0);

            return Err(format!(
                "Insufficient disk space. Required: {:.2} GB, Available: {:.2} GB",
                gb_required, gb_available
            ));
        }
    }

    // Copy the file
    file_ops::copy_file(&source_path_buf, &stash_path)
        .map_err(|e| format!("Failed to copy file: {}", e))?;

    // Verify checksum after copy (if we have one)
    if let Some(ref original_checksum) = model.checksum {
        let copied_checksum = file_ops::calculate_checksum(&stash_path)
            .map_err(|e| format!("Failed to verify copied file: {}", e))?;

        if &copied_checksum != original_checksum {
            // Clean up the bad copy
            let _ = std::fs::remove_file(&stash_path);
            return Err("Checksum verification failed - copy corrupted".to_string());
        }
    }

    // Update model to mark it as in stash
    let mut updated_model = model.clone();
    updated_model.exists_stash = true;
    operations::insert_or_update_model(&conn, &updated_model).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_model(
    model_id: String,
    delete_files: bool,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get model info before deleting (model_id is actually the filename)
    let model = operations::get_model_by_filename(&conn, &model_id)
        .map_err(|e| e.to_string())?
        .ok_or("Model not found")?;

    // Delete files if requested
    if delete_files {
        // Delete from source_path if it exists
        if let Some(ref source_path) = model.source_path {
            let source_path_buf = PathBuf::from(source_path);
            if source_path_buf.exists() {
                std::fs::remove_file(&source_path_buf)
                    .map_err(|e| format!("Failed to delete source file: {}", e))?;
            }
        }

        // Delete from stash if it exists
        if model.exists_stash {
            let stash_dir = state
                .stash_dir
                .lock()
                .map_err(|e| e.to_string())?
                .clone()
                .ok_or("STASH_DIR not configured")?;

            let stash_path = stash_dir.join(&model_id);
            if stash_path.exists() {
                std::fs::remove_file(&stash_path)
                    .map_err(|e| format!("Failed to delete stash file: {}", e))?;
            }
        }
    }

    // Delete from database
    operations::delete_model(&conn, &model_id).map_err(|e| e.to_string())?;

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
    from_mac_hd: bool,
    dt_config: &DrawThingsConfig,
) -> Result<(), String> {
    let filename = file_path
        .file_name()
        .ok_or("Invalid filename")?
        .to_string_lossy()
        .to_string();

    // Check if already exists
    if let Some(mut existing) = operations::get_model_by_filename(conn, &filename)
        .map_err(|e| e.to_string())?
    {
        // Update location flag and potentially update metadata from JSON
        if from_mac_hd {
            existing.exists_mac_hd = true;

            // Update display order from JSON if available
            if let Some(order) = dt_config.get_display_order(&filename) {
                existing.mac_display_order = Some(order);
            }
        } else {
            existing.exists_stash = true;
        }

        // Update display name if available in JSON
        if existing.display_name.is_none() {
            if let Some(name) = dt_config.get_display_name(&filename) {
                existing.display_name = Some(name);
            }
        }

        // Update model type if available in JSON
        if let Some(model_type) = dt_config.get_model_type(&filename) {
            existing.model_type = model_type;
        }

        // Update LoRA strength if available in JSON
        if existing.lora_strength.is_none() {
            if let Some(strength) = dt_config.get_lora_strength(&filename) {
                existing.lora_strength = Some(strength);
            }
        }

        operations::insert_or_update_model(conn, &existing).map_err(|e| e.to_string())?;
        return Ok(());
    }

    // Get file metadata
    let file_size = file_ops::get_file_size(file_path)
        .map_err(|e| e.to_string())?;

    // Skip checksum for speed
    let checksum = None;

    // Get metadata from JSON or fallback to detection
    let display_name = dt_config.get_display_name(&filename);
    let model_type = dt_config.get_model_type(&filename)
        .unwrap_or_else(|| detect_model_type(&filename));
    let mac_display_order = if from_mac_hd {
        dt_config.get_display_order(&filename)
    } else {
        None
    };
    let lora_strength = dt_config.get_lora_strength(&filename);

    // Create model record
    let model = CkptModel {
        filename: filename.clone(),
        display_name,
        model_type,
        file_size: Some(file_size as i64),
        checksum,
        source_path: Some(file_path.to_string_lossy().to_string()),
        exists_mac_hd: from_mac_hd,
        exists_stash: !from_mac_hd,
        mac_display_order,
        lora_strength,
        created_at: None,
        updated_at: None,
    };

    operations::insert_or_update_model(conn, &model).map_err(|e| e.to_string())?;
    Ok(())
}

fn detect_model_type(filename: &str) -> String {
    let filename_lower = filename.to_lowercase();

    // LoRA models
    if filename_lower.contains("lora") || filename_lower.contains("lycoris") {
        "lora".to_string()
    }
    // ControlNet models
    else if filename_lower.contains("control") || filename_lower.contains("t2i") {
        "control".to_string()
    }
    // CLIP encoders (including vision transformers)
    else if filename_lower.contains("clip") || filename_lower.contains("vit") || filename_lower.contains("vision_model") {
        "clip".to_string()
    }
    // Text encoders
    else if filename_lower.contains("text_encoder") || filename_lower.contains("t5") {
        "text".to_string()
    }
    // VAE / Autoencoders
    else if filename_lower.contains("vae") || filename_lower.contains("autoencoder") {
        "vae".to_string()
    }
    // Face restoration models
    else if filename_lower.contains("face") || filename_lower.contains("gfpgan") || filename_lower.contains("restoreformer") {
        "face_restorer".to_string()
    }
    // Upscaler models
    else if filename_lower.contains("upscale") || filename_lower.contains("esrgan") || filename_lower.contains("realesrgan") {
        "upscaler".to_string()
    }
    // Files not in JSON and not matching patterns - mark as unknown
    else {
        "unknown".to_string()
    }
}
