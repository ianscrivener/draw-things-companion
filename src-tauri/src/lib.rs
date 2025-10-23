mod db;
mod file_ops;
mod commands;
mod env_config;

use commands::AppState;
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Load environment variables from .env file
            env_config::load_env();
            
            // Get app data directory
            let app_dir = app.path().app_data_dir()
                .expect("Failed to get app data directory");
            
            // Ensure app directory exists
            std::fs::create_dir_all(&app_dir)
                .expect("Failed to create app directory");

            // Initialize database
            let db_path = app_dir.join("drawthings_companion.sqlite");
            let conn = Connection::open(&db_path)
                .expect("Failed to open database");

            // Run migrations
            db::schema::migrate_database(&conn)
                .expect("Failed to migrate database");

            // Try to load directories from .env file
            let dt_base_dir = env_config::get_dt_base_dir();
            let stash_dir = env_config::get_stash_dir();

            // If we have valid directories from .env, store them in the database
            if let (Some(ref dt_dir), Some(ref stash_dir_path)) = (&dt_base_dir, &stash_dir) {
                println!("Loaded from .env: DT_BASE_DIR={}, STASH_DIR={}", 
                    dt_dir.display(), stash_dir_path.display());
                
                // Store in config
                let _ = db::operations::set_config(
                    &conn, 
                    "DT_BASE_DIR", 
                    &dt_dir.to_string_lossy()
                );
                let _ = db::operations::set_config(
                    &conn, 
                    "STASH_DIR", 
                    &stash_dir_path.to_string_lossy()
                );
                
                // Ensure directories exist
                if stash_dir_path.exists() || std::fs::create_dir_all(&stash_dir_path).is_ok() {
                    let _ = db::operations::set_config(&conn, "STASH_EXISTS", "true");
                }
            }

            // Create app state with loaded directories
            let state = AppState {
                db: Mutex::new(conn),
                dt_base_dir: Mutex::new(dt_base_dir),
                stash_dir: Mutex::new(stash_dir),
            };

            app.manage(state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::get_config_value,
            commands::set_config_value,
            commands::get_app_paths,
            commands::update_stash_dir,
            commands::get_models,
            commands::add_model_to_mac,
            commands::remove_model_from_mac,
            commands::update_models_order,
            commands::scan_mac_models,
            commands::copy_model_to_stash,
            commands::initialize_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
