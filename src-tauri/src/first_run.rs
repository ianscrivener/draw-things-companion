use crate::db::operations;
use crate::file_ops;
use crate::logger;
use rusqlite::Connection;
use std::fs;
use std::path::Path;
use tauri::AppHandle;

/// Initialize the stash directory and perform first-run setup
pub fn initialize_stash(
    app: &AppHandle,
    conn: &Connection,
    dt_base_dir: &Path,
    stash_dir: &Path,
) -> Result<(), String> {
    logger::log_info(app, "Starting initialization process...".to_string());
    
    // Mark initialization as in progress
    operations::set_config(conn, "INIT_STATUS", "in_progress")
        .map_err(|e| format!("Failed to set init status: {}", e))?;
    
    // Check DTC_APP_DIR - we know it exists because database was opened successfully
    logger::log_success(app, "✓ DTC_APP_DIR exists (database initialized)".to_string());
    
    // Check STASH_DIR
    if stash_dir.exists() {
        logger::log_success(app, format!("✓ STASH_DIR exists: {}", stash_dir.display()));
    } else {
        logger::log_warning(app, format!("⚠ STASH_DIR does not exist: {}", stash_dir.display()));
    }
    
    // 1. Ensure stash directory structure exists (mkdir -p STASH_DIR/Models)
    let stash_models_dir = stash_dir.join("Models");
    
    // Check if Models directory exists
    if stash_models_dir.exists() {
        logger::log_success(app, format!("✓ STASH_DIR/Models exists: {}", stash_models_dir.display()));
    } else {
        logger::log_info(app, format!("Creating STASH_DIR/Models: {}", stash_models_dir.display()));
        file_ops::ensure_directory(&stash_models_dir)
            .map_err(|e| format!("Failed to create stash directory: {}", e))?;
        logger::log_success(app, format!("✓ Created STASH_DIR/Models: {}", stash_models_dir.display()));
    }

    // Check if this is the first run (stash directory is empty)
    let is_first_run = is_stash_empty(&stash_models_dir)?;
    
    if is_first_run {
        logger::log_info(app, "First run detected - initializing stash from DrawThings directory...".to_string());
    } else {
        logger::log_info(app, "Syncing models with DrawThings directory...".to_string());
    }
    
    // Copy/update all JSON config files first
    copy_json_files(app, dt_base_dir, stash_dir)?;
    
    // Then sync model files to ensure stash is up-to-date
    transfer_model_files(app, dt_base_dir, stash_dir)?;

    // Set STASH_EXISTS=true in config
    operations::set_config(conn, "STASH_EXISTS", "true")
        .map_err(|e| format!("Failed to set STASH_EXISTS config: {}", e))?;
    
    // Mark initialization as complete
    operations::set_config(conn, "INIT_STATUS", "complete")
        .map_err(|e| format!("Failed to set init status: {}", e))?;
    
    logger::log_success(app, "✓ All processing completed".to_string());
    
    Ok(())
}

/// Check if the stash Models directory is empty
fn is_stash_empty(stash_models_dir: &Path) -> Result<bool, String> {
    if !stash_models_dir.exists() {
        return Ok(true);
    }

    let entries = fs::read_dir(stash_models_dir)
        .map_err(|e| format!("Failed to read stash directory: {}", e))?;
    
    // Check if there are any .ckpt files
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.extension().and_then(|s| s.to_str()) == Some("ckpt") {
            return Ok(false);
        }
    }
    
    Ok(true)
}

/// Transfer all model files from DT_BASE_DIR/Models to STASH_DIR/Models
fn transfer_model_files(app: &AppHandle, dt_base_dir: &Path, stash_dir: &Path) -> Result<(), String> {
    let dt_models_dir = dt_base_dir.join("Models");
    let stash_models_dir = stash_dir.join("Models");
    
    if !dt_models_dir.exists() {
        let msg = format!("DrawThings Models directory not found: {}", dt_models_dir.display());
        logger::log_error(app, msg.clone());
        return Err(msg);
    }

    logger::log_info(app, format!("Syncing model files from {}", dt_models_dir.display()));

    let entries = fs::read_dir(&dt_models_dir)
        .map_err(|e| format!("Failed to read DrawThings Models directory: {}", e))?;
    
    let mut copied_count = 0;
    let mut skipped_count = 0;
    let mut error_count = 0;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        // Only copy .ckpt files
        if path.extension().and_then(|s| s.to_str()) == Some("ckpt") {
            if let Some(filename) = path.file_name() {
                let dest_path = stash_models_dir.join(filename);
                
                // Only copy if it doesn't exist or source is newer
                let should_copy = if dest_path.exists() {
                    match (fs::metadata(&path), fs::metadata(&dest_path)) {
                        (Ok(src_meta), Ok(dest_meta)) => {
                            // Copy if source is newer or different size
                            let size_different = src_meta.len() != dest_meta.len();
                            let src_newer = src_meta.modified().ok() > dest_meta.modified().ok();
                            size_different || src_newer
                        }
                        _ => true, // Copy if we can't get metadata
                    }
                } else {
                    true // Copy if doesn't exist
                };
                
                if should_copy {
                    match fs::copy(&path, &dest_path) {
                        Ok(bytes) => {
                            copied_count += 1;
                            let mb = bytes as f64 / (1024.0 * 1024.0);
                            logger::log_info(app, format!("  Copied: {} ({:.1} MB)", filename.to_string_lossy(), mb));
                        }
                        Err(e) => {
                            error_count += 1;
                            logger::log_error(app, format!("  Error copying {}: {}", filename.to_string_lossy(), e));
                        }
                    }
                } else {
                    skipped_count += 1;
                }
            }
        }
    }
    
    if copied_count > 0 {
        logger::log_success(app, format!("✓ Copied {} model files ({} already up-to-date, {} errors)", 
            copied_count, skipped_count, error_count));
    } else if skipped_count > 0 {
        logger::log_info(app, format!("✓ All {} model files are up-to-date", skipped_count));
    } else {
        logger::log_warning(app, "⚠ No .ckpt files found in DrawThings Models directory".to_string());
    }
    
    Ok(())
}

/// Copy all JSON config files from DT_BASE_DIR/Models to STASH_DIR/Models
fn copy_json_files(app: &AppHandle, dt_base_dir: &Path, stash_dir: &Path) -> Result<(), String> {
    let dt_models_dir = dt_base_dir.join("Models");
    let stash_models_dir = stash_dir.join("Models");
    
    if !dt_models_dir.exists() {
        let msg = format!("DrawThings Models directory not found: {}", dt_models_dir.display());
        logger::log_error(app, msg.clone());
        return Err(msg);
    }

    logger::log_info(app, "Copying JSON config files...".to_string());

    let entries = fs::read_dir(&dt_models_dir)
        .map_err(|e| format!("Failed to read DrawThings Models directory: {}", e))?;
    
    let mut copied_count = 0;
    let mut skipped_count = 0;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        // Only copy .json files
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Some(filename) = path.file_name() {
                let dest_path = stash_models_dir.join(filename);
                
                // Only copy if it doesn't exist or is different
                let should_copy = if dest_path.exists() {
                    // Compare file contents or timestamps
                    match (fs::metadata(&path), fs::metadata(&dest_path)) {
                        (Ok(src_meta), Ok(dest_meta)) => {
                            // Copy if source is newer
                            src_meta.modified().ok() > dest_meta.modified().ok()
                        }
                        _ => true, // Copy if we can't get metadata
                    }
                } else {
                    true // Copy if doesn't exist
                };
                
                if should_copy {
                    match fs::copy(&path, &dest_path) {
                        Ok(_) => {
                            copied_count += 1;
                            logger::log_info(app, format!("  Copied JSON: {}", filename.to_string_lossy()));
                        }
                        Err(e) => {
                            logger::log_error(app, format!("  Error copying {}: {}", filename.to_string_lossy(), e));
                        }
                    }
                } else {
                    skipped_count += 1;
                }
            }
        }
    }
    
    if copied_count > 0 {
        logger::log_success(app, format!("✓ Copied {} JSON config files ({} already up-to-date)", copied_count, skipped_count));
    } else if skipped_count > 0 {
        logger::log_info(app, format!("✓ All {} JSON config files are up-to-date", skipped_count));
    } else {
        logger::log_info(app, "  No JSON files found in DrawThings Models directory".to_string());
    }
    
    Ok(())
}
