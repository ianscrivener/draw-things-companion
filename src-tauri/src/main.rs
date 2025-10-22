// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    draw_things_companion_lib::run()
}

fn get_file_info(path: String) -> Result<(u64, i64, i64), String> {
    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    Ok((
        meta.len(),
        meta.mtime(),
        meta.mtime_nsec() // or use birth_time() for creation
    ))
}