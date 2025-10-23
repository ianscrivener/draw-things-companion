use rusqlite::{Connection, Result};

pub fn create_tables(conn: &Connection) -> Result<()> {
    // Models table - stores metadata for all model files
    conn.execute(
        "CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL UNIQUE,
            display_name TEXT,
            model_type TEXT NOT NULL CHECK(model_type IN ('model', 'lora', 'controlnet')),
            file_size INTEGER,
            checksum TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Mac models table - tracks which models are visible on Mac HD and their order
    conn.execute(
        "CREATE TABLE IF NOT EXISTS mac_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER NOT NULL UNIQUE,
            display_order INTEGER NOT NULL,
            is_visible INTEGER DEFAULT 1,
            custom_name TEXT,
            lora_strength REAL,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Stash models table - tracks models in the stash directory
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stash_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER NOT NULL UNIQUE,
            stash_path TEXT NOT NULL,
            last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Config table - stores app configuration
    conn.execute(
        "CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create indexes for better query performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_models_type ON models(model_type)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_mac_models_order ON mac_models(display_order)",
        [],
    )?;

    Ok(())
}

pub fn migrate_database(conn: &Connection) -> Result<()> {
    // Get current schema version
    let version: i32 = conn
        .query_row(
            "SELECT COALESCE((SELECT value FROM config WHERE key = 'schema_version'), '0')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Run migrations based on current version
    if version < 1 {
        create_tables(conn)?;
        conn.execute(
            "INSERT OR REPLACE INTO config (key, value) VALUES ('schema_version', '1')",
            [],
        )?;
    }

    // Future migrations can be added here
    // if version < 2 { ... }

    Ok(())
}
