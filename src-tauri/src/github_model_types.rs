use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::Path;

/// GitHub model types configuration from settings.json
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GithubModelTypes {
    #[serde(default)]
    pub models: Option<String>,
    #[serde(default)]
    pub loras: Option<String>,
    #[serde(default)]
    pub controlnets: Option<String>,
    #[serde(default)]
    pub embeddings: Option<String>,
}

/// Parsed model filenames from GitHub text files
#[derive(Debug, Clone)]
pub struct ModelTypeRegistry {
    pub main_models: HashSet<String>,
    pub loras: HashSet<String>,
    pub controlnets: HashSet<String>,
    pub embeddings: HashSet<String>,
}

impl ModelTypeRegistry {
    pub fn new() -> Self {
        ModelTypeRegistry {
            main_models: HashSet::new(),
            loras: HashSet::new(),
            controlnets: HashSet::new(),
            embeddings: HashSet::new(),
        }
    }

    /// Load model types from GitHub URLs specified in settings
    pub async fn load_from_github(config: &GithubModelTypes) -> Result<Self, String> {
        let mut registry = ModelTypeRegistry::new();

        // Download and parse main models
        if let Some(ref url) = config.models {
            match download_and_parse_list(url).await {
                Ok(models) => {
                    registry.main_models = models;
                    println!("Loaded {} main models from GitHub", registry.main_models.len());
                }
                Err(e) => eprintln!("Failed to load models from {}: {}", url, e),
            }
        }

        // Download and parse LoRAs
        if let Some(ref url) = config.loras {
            match download_and_parse_list(url).await {
                Ok(loras) => {
                    registry.loras = loras;
                    println!("Loaded {} LoRAs from GitHub", registry.loras.len());
                }
                Err(e) => eprintln!("Failed to load loras from {}: {}", url, e),
            }
        }

        // Download and parse ControlNets
        if let Some(ref url) = config.controlnets {
            match download_and_parse_list(url).await {
                Ok(controlnets) => {
                    registry.controlnets = controlnets;
                    println!("Loaded {} ControlNets from GitHub", registry.controlnets.len());
                }
                Err(e) => eprintln!("Failed to load controlnets from {}: {}", url, e),
            }
        }

        // Download and parse Embeddings
        if let Some(ref url) = config.embeddings {
            match download_and_parse_list(url).await {
                Ok(embeddings) => {
                    registry.embeddings = embeddings;
                    println!("Loaded {} Embeddings from GitHub", registry.embeddings.len());
                }
                Err(e) => eprintln!("Failed to load embeddings from {}: {}", url, e),
            }
        }

        Ok(registry)
    }

    /// Check if a filename is a known main model
    pub fn is_main_model(&self, filename: &str) -> bool {
        self.main_models.contains(filename)
    }

    /// Check if a filename is a known LoRA
    pub fn is_lora(&self, filename: &str) -> bool {
        self.loras.contains(filename)
    }

    /// Check if a filename is a known ControlNet
    pub fn is_controlnet(&self, filename: &str) -> bool {
        self.controlnets.contains(filename)
    }

    /// Check if a filename is a known Embedding
    pub fn is_embedding(&self, filename: &str) -> bool {
        self.embeddings.contains(filename)
    }

    /// Determine model type for a filename
    /// Returns Some(type) if found in registry, None otherwise
    pub fn get_model_type(&self, filename: &str) -> Option<String> {
        if self.is_main_model(filename) {
            Some("model".to_string())
        } else if self.is_lora(filename) {
            Some("lora".to_string())
        } else if self.is_controlnet(filename) {
            Some("control".to_string())
        } else if self.is_embedding(filename) {
            Some("embedding".to_string())
        } else {
            None
        }
    }
}

/// Download a text file from URL and parse it into a set of filenames (async)
async fn download_and_parse_list(url: &str) -> Result<HashSet<String>, String> {
    // Download the file
    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to download {}: {}", url, e))?;

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Parse lines into set (one filename per line)
    let filenames: HashSet<String> = text
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .map(|line| line.to_string())
        .collect();

    Ok(filenames)
}

/// Download a text file from URL and parse it (blocking version)
fn download_and_parse_list_blocking(url: &str) -> Result<HashSet<String>, String> {
    // Download the file (blocking)
    let response = reqwest::blocking::get(url)
        .map_err(|e| format!("Failed to download {}: {}", url, e))?;

    let text = response
        .text()
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Parse lines into set (one filename per line)
    let filenames: HashSet<String> = text
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .map(|line| line.to_string())
        .collect();

    Ok(filenames)
}

impl ModelTypeRegistry {
    /// Load model types from GitHub URLs (blocking version for use in non-async contexts)
    pub fn load_from_github_blocking(config: &GithubModelTypes) -> Result<Self, String> {
        let mut registry = ModelTypeRegistry::new();

        // Download and parse main models
        if let Some(ref url) = config.models {
            match download_and_parse_list_blocking(url) {
                Ok(models) => {
                    registry.main_models = models;
                    println!("Loaded {} main models from GitHub", registry.main_models.len());
                }
                Err(e) => eprintln!("Failed to load models from {}: {}", url, e),
            }
        }

        // Download and parse LoRAs
        if let Some(ref url) = config.loras {
            match download_and_parse_list_blocking(url) {
                Ok(loras) => {
                    registry.loras = loras;
                    println!("Loaded {} LoRAs from GitHub", registry.loras.len());
                }
                Err(e) => eprintln!("Failed to load loras from {}: {}", url, e),
            }
        }

        // Download and parse ControlNets
        if let Some(ref url) = config.controlnets {
            match download_and_parse_list_blocking(url) {
                Ok(controlnets) => {
                    registry.controlnets = controlnets;
                    println!("Loaded {} ControlNets from GitHub", registry.controlnets.len());
                }
                Err(e) => eprintln!("Failed to load controlnets from {}: {}", url, e),
            }
        }

        // Download and parse Embeddings
        if let Some(ref url) = config.embeddings {
            match download_and_parse_list_blocking(url) {
                Ok(embeddings) => {
                    registry.embeddings = embeddings;
                    println!("Loaded {} Embeddings from GitHub", registry.embeddings.len());
                }
                Err(e) => eprintln!("Failed to load embeddings from {}: {}", url, e),
            }
        }

        Ok(registry)
    }
}

/// Parse github_model_types from settings.json
pub fn parse_github_model_types<P: AsRef<Path>>(settings_path: P) -> Result<GithubModelTypes, String> {
    let content = fs::read_to_string(settings_path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;

    // Try parsing as JSON
    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
        if let Some(github_types) = json.get("github_model_types") {
            return serde_json::from_value(github_types.clone())
                .map_err(|e| format!("Failed to parse github_model_types: {}", e));
        }
    }

    Err("github_model_types not found in settings".to_string())
}

/// Load GitHub model registry from default settings.json location
pub fn load_default_github_registry() -> Option<ModelTypeRegistry> {
    // Path to settings.json in the project root
    let settings_path = std::env::current_dir()
        .ok()?
        .parent()? // Go up from src-tauri to project root
        .join("settings.json");

    println!("Loading GitHub model types from: {}", settings_path.display());

    // Parse configuration
    let config = match parse_github_model_types(&settings_path) {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Failed to parse settings.json: {}", e);
            return None;
        }
    };

    // Load registry
    match ModelTypeRegistry::load_from_github_blocking(&config) {
        Ok(registry) => Some(registry),
        Err(e) => {
            eprintln!("Failed to load GitHub model registry: {}", e);
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_registry() {
        let mut registry = ModelTypeRegistry::new();
        registry.main_models.insert("flux_1_dev.ckpt".to_string());
        registry.loras.insert("my_lora.ckpt".to_string());

        assert_eq!(registry.get_model_type("flux_1_dev.ckpt"), Some("model".to_string()));
        assert_eq!(registry.get_model_type("my_lora.ckpt"), Some("lora".to_string()));
        assert_eq!(registry.get_model_type("unknown.ckpt"), None);
    }
}
