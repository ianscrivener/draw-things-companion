use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEvent {
    pub timestamp: String,
    pub level: String,  // "info", "success", "warning", "error"
    pub message: String,
}

impl LogEvent {
    pub fn new(level: &str, message: String) -> Self {
        let timestamp = chrono::Local::now().format("%H:%M:%S").to_string();
        Self {
            timestamp,
            level: level.to_string(),
            message,
        }
    }
}

// Global log storage
pub struct LogStore {
    pub logs: Mutex<Vec<LogEvent>>,
}

impl LogStore {
    pub fn new() -> Self {
        Self {
            logs: Mutex::new(Vec::new()),
        }
    }
}

/// Emit a log event to the frontend
pub fn emit_log(app: &AppHandle, level: &str, message: String) {
    let log_event = LogEvent::new(level, message.clone());
    
    // Store in global log store
    if let Some(log_store) = app.try_state::<LogStore>() {
        if let Ok(mut logs) = log_store.logs.lock() {
            logs.push(log_event.clone());
            // Keep only last 1000 logs
            let len = logs.len();
            if len > 1000 {
                logs.drain(0..len - 1000);
            }
        }
    }
    
    // Also print to console
    match level {
        "error" => eprintln!("[{}] {}", level.to_uppercase(), message),
        _ => println!("[{}] {}", level.to_uppercase(), message),
    }
    
    // Emit to frontend
    let _ = app.emit("log-event", log_event);
}

/// Helper functions for different log levels
pub fn log_info(app: &AppHandle, message: String) {
    emit_log(app, "info", message);
}

pub fn log_success(app: &AppHandle, message: String) {
    emit_log(app, "success", message);
}

pub fn log_warning(app: &AppHandle, message: String) {
    emit_log(app, "warning", message);
}

pub fn log_error(app: &AppHandle, message: String) {
    emit_log(app, "error", message);
}
