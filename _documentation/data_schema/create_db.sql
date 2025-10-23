-- ########################################################
-- Models table
DROP TABLE IF EXISTS ckpt_models;

CREATE TABLE ckpt_models (
    filename TEXT PRIMARY KEY NOT NULL,
    display_name TEXT,
    model_type TEXT NOT NULL,  -- model, lora, control, clip, text, face_restorer, upscaler, unknown
    file_size INTEGER,
    checksum TEXT,  -- nullable, for future integrity verification
    source_path TEXT,
    
    -- Location tracking
    exists_mac_hd BOOLEAN DEFAULT FALSE,
    exists_stash BOOLEAN DEFAULT FALSE,
    
    -- Mac HD display ordering (Stash is alphabetical, no order needed)
    mac_display_order INTEGER,
    
    -- LoRA specific (nullable for other types)
    lora_strength INTEGER,  -- value × 10 (e.g., 75 = 7.5 strength)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);


-- ########################################################
-- Relationships between models (e.g., main model → CLIP/text encoders)
DROP TABLE IF EXISTS ckpt_x_ckpt;

CREATE TABLE ckpt_x_ckpt (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_ckpt_filename TEXT NOT NULL,
    child_ckpt_filename TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
    UNIQUE(parent_ckpt_filename, child_ckpt_filename),
    FOREIGN KEY (parent_ckpt_filename) REFERENCES ckpt_models(filename) ON DELETE CASCADE,
    FOREIGN KEY (child_ckpt_filename) REFERENCES ckpt_models(filename) ON DELETE CASCADE
);


-- ########################################################
-- App configuration (paths, settings, schema version)
DROP TABLE IF EXISTS config;

CREATE TABLE config (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);