mod db;
mod file_ops;
mod commands;
mod env_config;
mod first_run;
mod logger;

use commands::AppState;
use logger::LogStore;
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
            
            // Get app directory from environment (DTC_APP_DIR) or fallback to default
            let app_dir = env_config::get_app_dir()
                .unwrap_or_else(|| {
                    env_config::expand_path("~/.drawthings_companion")
                });
            
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
                
                // Run first-run initialization in background thread
                let db_path_clone = db_path.clone();
                let dt_dir_clone = dt_dir.clone();
                let stash_dir_clone = stash_dir_path.clone();
                let app_handle = app.handle().clone();
                
                std::thread::spawn(move || {
                    logger::log_info(&app_handle, "Starting background initialization...".to_string());
                    
                    // Open a new database connection for this thread
                    match Connection::open(&db_path_clone) {
                        Ok(thread_conn) => {
                            match first_run::initialize_stash(&app_handle, &thread_conn, &dt_dir_clone, &stash_dir_clone) {
                                Ok(_) => logger::log_success(&app_handle, "✓ Background initialization complete".to_string()),
                                Err(e) => {
                                    logger::log_error(&app_handle, format!("Background initialization error: {}", e));
                                    // Mark as error in database
                                    let _ = db::operations::set_config(&thread_conn, "INIT_STATUS", "error");
                                    let _ = db::operations::set_config(&thread_conn, "INIT_ERROR", &e);
                                }
                            }
                        }
                        Err(e) => logger::log_error(&app_handle, format!("Failed to open database in background thread: {}", e)),
                    }
                });
            }

            // Create app state with loaded directories
            let state = AppState {
                db: Mutex::new(conn),
                dt_base_dir: Mutex::new(dt_base_dir),
                stash_dir: Mutex::new(stash_dir),
            };

            app.manage(state);
            
            // Create and manage log store
            app.manage(LogStore::new());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::get_config_value,
            commands::set_config_value,
            commands::get_initialization_status,
            commands::get_app_paths,
            commands::update_stash_dir,
            commands::get_models,
            commands::add_model_to_mac,
            commands::remove_model_from_mac,
            commands::update_models_order,
            commands::scan_mac_models,
            commands::copy_model_to_stash,
            commands::delete_model,
            commands::initialize_app,
            commands::get_all_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
