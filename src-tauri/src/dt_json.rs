use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Main model entry from custom.json
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomModel {
    pub name: String,
    pub file: String,
    #[serde(default)]
    pub autoencoder: Option<String>,
    #[serde(default)]
    pub clip_encoder: Option<String>,
    #[serde(default)]
    pub text_encoder: Option<String>,
    #[serde(default)]
    pub version: Option<String>,
    // Other fields we don't currently need
}

/// LoRA weight structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoraWeight {
    pub value: f64,
    #[serde(default)]
    pub lower_bound: Option<f64>,
    #[serde(default)]
    pub upper_bound: Option<f64>,
}

/// LoRA entry from custom_lora.json
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomLora {
    pub name: String,
    pub file: String,
    #[serde(default)]
    pub weight: Option<LoraWeight>,
    #[serde(default)]
    pub version: Option<String>,
    // Other fields we don't currently need
}

/// ControlNet entry from custom_controlnet.json
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomControlNet {
    pub name: String,
    pub file: String,
    #[serde(default)]
    pub version: Option<String>,
    // Other fields we don't currently need
}

/// Parsed DrawThings configuration data
#[derive(Debug, Clone)]
pub struct DrawThingsConfig {
    pub models: Vec<CustomModel>,
    pub loras: Vec<CustomLora>,
    pub controlnets: Vec<CustomControlNet>,

    // Lookup maps for efficient queries
    pub file_to_model_name: HashMap<String, String>,
    pub file_to_model_type: HashMap<String, String>,
    pub file_to_display_order: HashMap<String, i32>,
    pub file_to_lora_strength: HashMap<String, i32>, // value × 10

    // Relationship tracking
    pub main_model_to_encoders: HashMap<String, Vec<String>>,
}

impl DrawThingsConfig {
    /// Parse all DrawThings JSON config files from the DT_BASE_DIR/Models directory
    pub fn parse_from_directory<P: AsRef<Path>>(models_dir: P) -> Result<Self, String> {
        let models_dir = models_dir.as_ref();

        // Parse main models
        let custom_json_path = models_dir.join("custom.json");
        let models: Vec<CustomModel> = if custom_json_path.exists() {
            let content = fs::read_to_string(&custom_json_path)
                .map_err(|e| format!("Failed to read custom.json: {}", e))?;
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse custom.json: {}", e))?
        } else {
            Vec::new()
        };

        // Parse LoRAs
        let custom_lora_path = models_dir.join("custom_lora.json");
        let loras: Vec<CustomLora> = if custom_lora_path.exists() {
            let content = fs::read_to_string(&custom_lora_path)
                .map_err(|e| format!("Failed to read custom_lora.json: {}", e))?;
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse custom_lora.json: {}", e))?
        } else {
            Vec::new()
        };

        // Parse ControlNets
        let custom_controlnet_path = models_dir.join("custom_controlnet.json");
        let controlnets: Vec<CustomControlNet> = if custom_controlnet_path.exists() {
            let content = fs::read_to_string(&custom_controlnet_path)
                .map_err(|e| format!("Failed to read custom_controlnet.json: {}", e))?;
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse custom_controlnet.json: {}", e))?
        } else {
            Vec::new()
        };

        // Build lookup maps
        let mut file_to_model_name = HashMap::new();
        let mut file_to_model_type = HashMap::new();
        let mut file_to_display_order = HashMap::new();
        let mut file_to_lora_strength = HashMap::new();
        let mut main_model_to_encoders = HashMap::new();

        // Process main models
        for (index, model) in models.iter().enumerate() {
            file_to_model_name.insert(model.file.clone(), model.name.clone());
            file_to_model_type.insert(model.file.clone(), "model".to_string());
            file_to_display_order.insert(model.file.clone(), index as i32);

            // Track encoder relationships
            let mut encoders = Vec::new();

            if let Some(ref autoencoder) = model.autoencoder {
                file_to_model_type.entry(autoencoder.clone()).or_insert("vae".to_string());
                encoders.push(autoencoder.clone());
            }

            if let Some(ref clip_encoder) = model.clip_encoder {
                file_to_model_type.entry(clip_encoder.clone()).or_insert("clip".to_string());
                encoders.push(clip_encoder.clone());
            }

            if let Some(ref text_encoder) = model.text_encoder {
                file_to_model_type.entry(text_encoder.clone()).or_insert("text".to_string());
                encoders.push(text_encoder.clone());
            }

            if !encoders.is_empty() {
                main_model_to_encoders.insert(model.file.clone(), encoders);
            }
        }

        // Process LoRAs
        for (index, lora) in loras.iter().enumerate() {
            file_to_model_name.insert(lora.file.clone(), lora.name.clone());
            file_to_model_type.insert(lora.file.clone(), "lora".to_string());
            file_to_display_order.insert(lora.file.clone(), index as i32);

            // Convert weight to integer (× 10 for storage)
            if let Some(ref weight) = lora.weight {
                let strength = (weight.value * 10.0).round() as i32;
                file_to_lora_strength.insert(lora.file.clone(), strength);
            }
        }

        // Process ControlNets
        for (index, controlnet) in controlnets.iter().enumerate() {
            file_to_model_name.insert(controlnet.file.clone(), controlnet.name.clone());
            file_to_model_type.insert(controlnet.file.clone(), "control".to_string());
            file_to_display_order.insert(controlnet.file.clone(), index as i32);
        }

        Ok(DrawThingsConfig {
            models,
            loras,
            controlnets,
            file_to_model_name,
            file_to_model_type,
            file_to_display_order,
            file_to_lora_strength,
            main_model_to_encoders,
        })
    }

    /// Get display name for a file, or None if not in JSON
    pub fn get_display_name(&self, filename: &str) -> Option<String> {
        self.file_to_model_name.get(filename).cloned()
    }

    /// Get model type for a file, or None if not in JSON
    pub fn get_model_type(&self, filename: &str) -> Option<String> {
        self.file_to_model_type.get(filename).cloned()
    }

    /// Get display order for a file (Mac HD only), or None if not in JSON
    pub fn get_display_order(&self, filename: &str) -> Option<i32> {
        self.file_to_display_order.get(filename).cloned()
    }

    /// Get LoRA strength for a file, or None if not a LoRA or no weight specified
    pub fn get_lora_strength(&self, filename: &str) -> Option<i32> {
        self.file_to_lora_strength.get(filename).cloned()
    }

    /// Get encoder files used by a main model
    pub fn get_model_encoders(&self, filename: &str) -> Option<Vec<String>> {
        self.main_model_to_encoders.get(filename).cloned()
    }

    /// Check if a file is referenced in any JSON config
    pub fn is_file_in_config(&self, filename: &str) -> bool {
        self.file_to_model_type.contains_key(filename)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_config() {
        // This test would require actual JSON files
        // For now, just test that the structures can be created
        let config = DrawThingsConfig {
            models: vec![],
            loras: vec![],
            controlnets: vec![],
            file_to_model_name: HashMap::new(),
            file_to_model_type: HashMap::new(),
            file_to_display_order: HashMap::new(),
            file_to_lora_strength: HashMap::new(),
            main_model_to_encoders: HashMap::new(),
        };

        assert_eq!(config.models.len(), 0);
    }
}
