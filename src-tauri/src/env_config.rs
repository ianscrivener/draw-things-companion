use std::env;
use std::path::PathBuf;

/// Load environment variables from .env file
pub fn load_env() {
    // Try to load from project root (parent of src-tauri)
    if let Err(e) = dotenvy::from_filename("../.env") {
        // If that fails, try current directory
        if let Err(e2) = dotenvy::dotenv() {
            println!("Warning: Could not load .env file: {} or {}", e, e2);
        }
    }
}

/// Expand tilde (~) in path to home directory
pub fn expand_path(path: &str) -> PathBuf {
    if path.starts_with("~/") {
        if let Some(home) = env::var_os("HOME") {
            let mut home_path = PathBuf::from(home);
            home_path.push(&path[2..]);
            return home_path;
        }
    }
    PathBuf::from(path)
}

/// Get DT_BASE_DIR from environment
pub fn get_dt_base_dir() -> Option<PathBuf> {
    env::var("DT_BASE_DIR")
        .ok()
        .map(|path| expand_path(&path))
}

/// Get STASH_DIR from environment
pub fn get_stash_dir() -> Option<PathBuf> {
    env::var("STASH_DIR")
        .ok()
        .map(|path| expand_path(&path))
}

/// Get DTC_APP_DIR from environment
#[allow(dead_code)]
pub fn get_app_dir() -> Option<PathBuf> {
    env::var("DTC_APP_DIR")
        .ok()
        .map(|path| expand_path(&path))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expand_path_with_tilde() {
        let path = "~/Documents/test";
        let expanded = expand_path(path);
        assert!(!expanded.to_string_lossy().contains('~'));
    }

    #[test]
    fn test_expand_path_without_tilde() {
        let path = "/absolute/path/test";
        let expanded = expand_path(path);
        assert_eq!(expanded, PathBuf::from(path));
    }
}
