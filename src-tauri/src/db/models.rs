use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub id: Option<i64>,
    pub filename: String,
    pub display_name: Option<String>,
    pub model_type: String,
    pub file_size: Option<i64>,
    pub checksum: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MacModel {
    pub id: Option<i64>,
    pub model_id: i64,
    pub display_order: i32,
    pub is_visible: bool,
    pub custom_name: Option<String>,
    pub lora_strength: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StashModel {
    pub id: Option<i64>,
    pub model_id: i64,
    pub stash_path: String,
    pub last_synced: Option<String>,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub key: String,
    pub value: String,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelWithMacInfo {
    #[serde(flatten)]
    pub model: Model,
    pub display_order: Option<i32>,
    pub is_on_mac: bool,
    pub custom_name: Option<String>,
    pub lora_strength: Option<f64>,
}
