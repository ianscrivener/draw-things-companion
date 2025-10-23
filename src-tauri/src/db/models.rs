use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CkptModel {
    pub filename: String,
    pub display_name: Option<String>,
    pub model_type: String,
    pub file_size: Option<i64>,
    pub checksum: Option<String>,
    pub source_path: Option<String>,
    pub exists_mac_hd: bool,
    pub exists_stash: bool,
    pub mac_display_order: Option<i32>,
    pub lora_strength: Option<i32>, // value × 10 (e.g., 75 = 7.5)
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CkptRelationship {
    pub id: i32,
    pub parent_ckpt_filename: String,
    pub child_ckpt_filename: String,
    pub created_at: Option<String>,
}

// Response structure for frontend (matches what TwoPaneManager expects)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelResponse {
    pub model: CkptModel,
    pub is_on_mac: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub key: String,
    pub value: String,
    pub updated_at: Option<String>,
}
