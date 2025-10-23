use sha2::{Digest, Sha256};
use std::fs;
use std::io::{self, Read};
use std::path::{Path, PathBuf};

/// Calculate SHA256 checksum of a file
pub fn calculate_checksum<P: AsRef<Path>>(path: P) -> io::Result<String> {
    let mut file = fs::File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192];

    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    Ok(hex::encode(hasher.finalize()))
}

/// Get file metadata
pub fn get_file_size<P: AsRef<Path>>(path: P) -> io::Result<u64> {
    let metadata = fs::metadata(path)?;
    Ok(metadata.len())
}

/// Scan directory for model files
pub fn scan_directory<P: AsRef<Path>>(dir: P, extensions: &[&str]) -> io::Result<Vec<PathBuf>> {
    let mut model_files = Vec::new();

    if !dir.as_ref().exists() {
        return Ok(model_files);
    }

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() {
            if let Some(ext) = path.extension() {
                let ext_str = ext.to_string_lossy().to_lowercase();
                if extensions.contains(&ext_str.as_ref()) {
                    model_files.push(path);
                }
            }
        }
    }

    model_files.sort();
    Ok(model_files)
}

/// Copy file with progress tracking
#[allow(dead_code)]
pub fn copy_file<P: AsRef<Path>, Q: AsRef<Path>>(
    source: P,
    destination: Q,
) -> io::Result<u64> {
    // Ensure destination directory exists
    if let Some(parent) = destination.as_ref().parent() {
        fs::create_dir_all(parent)?;
    }

    fs::copy(source, destination)
}

/// Move file
#[allow(dead_code)]
pub fn move_file<P: AsRef<Path>, Q: AsRef<Path>>(
    source: P,
    destination: Q,
) -> io::Result<()> {
    // Ensure destination directory exists
    if let Some(parent) = destination.as_ref().parent() {
        fs::create_dir_all(parent)?;
    }

    fs::rename(source, destination)
}

/// Delete file
#[allow(dead_code)]
pub fn delete_file<P: AsRef<Path>>(path: P) -> io::Result<()> {
    fs::remove_file(path)
}

/// Ensure directory exists
pub fn ensure_directory<P: AsRef<Path>>(path: P) -> io::Result<()> {
    fs::create_dir_all(path)
}

/// Check if file exists
#[allow(dead_code)]
pub fn file_exists<P: AsRef<Path>>(path: P) -> bool {
    path.as_ref().exists()
}

/// Get model file extensions based on type
pub fn get_model_extensions(model_type: &str) -> Vec<&'static str> {
    match model_type {
        "model" => vec!["ckpt", "safetensors", "pt", "pth"],
        "lora" => vec!["safetensors", "pt", "pth"],
        "controlnet" => vec!["safetensors", "pt", "pth"],
        _ => vec![],
    }
}

/// Get available disk space for a given path (in bytes)
#[cfg(target_os = "macos")]
pub fn get_available_space<P: AsRef<Path>>(path: P) -> io::Result<u64> {
    use std::ffi::CString;
    use std::mem;
    use std::os::unix::ffi::OsStrExt;

    unsafe {
        let path_cstring = CString::new(path.as_ref().as_os_str().as_bytes())
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Invalid path"))?;

        let mut stat: libc::statfs = mem::zeroed();
        if libc::statfs(path_cstring.as_ptr(), &mut stat) == 0 {
            // Available blocks * block size = available bytes
            Ok((stat.f_bavail as u64) * (stat.f_bsize as u64))
        } else {
            Err(io::Error::last_os_error())
        }
    }
}

#[cfg(not(target_os = "macos"))]
pub fn get_available_space<P: AsRef<Path>>(_path: P) -> io::Result<u64> {
    // Fallback for other platforms - return a large number
    Ok(u64::MAX)
}

/// Check if there's enough space for a file copy operation
pub fn has_enough_space<P: AsRef<Path>>(destination: P, required_bytes: u64) -> io::Result<bool> {
    let available = get_available_space(destination)?;
    // Add 10% buffer for safety
    let required_with_buffer = required_bytes + (required_bytes / 10);
    Ok(available >= required_with_buffer)
}
