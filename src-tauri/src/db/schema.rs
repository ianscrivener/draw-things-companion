use rusqlite::{Connection, Result};

pub fn migrate_database(conn: &Connection) -> Result<()> {
    // Get current schema version
    let version: i32 = conn
        .query_row(
            "SELECT CAST(value AS INTEGER) FROM config WHERE key = 'schema_version'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    println!("Current schema version: {}", version);

    if version < 1 {
        println!("Running migration v1...");
        create_initial_schema(conn)?;
    }

    if version < 2 {
        println!("Running migration v2...");
        migrate_to_v2(conn)?;
    }

    if version < 3 {
        println!("Running migration v3 (new schema)...");
        migrate_to_v3(conn)?;
    }

    Ok(())
}

fn create_initial_schema(conn: &Connection) -> Result<()> {
    // Create config table first
    conn.execute(
        "CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT,
            updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )",
        [],
    )?;

    // Old schema tables (will be migrated in v3)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL UNIQUE,
            display_name TEXT,
            model_type TEXT NOT NULL,
            file_size INTEGER,
            checksum TEXT,
            source_path TEXT,
            created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
            updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS mac_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER NOT NULL,
            display_order INTEGER,
            is_visible BOOLEAN DEFAULT TRUE,
            custom_name TEXT,
            lora_strength REAL,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS stash_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER NOT NULL,
            stash_path TEXT,
            last_synced TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "INSERT OR REPLACE INTO config (key, value) VALUES ('schema_version', '1')",
        [],
    )?;

    Ok(())
}

fn migrate_to_v2(conn: &Connection) -> Result<()> {
    // v2 added source_path (already exists from v1, so nothing to do)
    conn.execute(
        "UPDATE config SET value = '2' WHERE key = 'schema_version'",
        [],
    )?;
    Ok(())
}

fn migrate_to_v3(conn: &Connection) -> Result<()> {
    println!("Migrating to new schema (v3)...");

    // Create new ckpt_models table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ckpt_models (
            filename TEXT PRIMARY KEY NOT NULL,
            display_name TEXT,
            model_type TEXT NOT NULL,
            file_size INTEGER,
            checksum TEXT,
            source_path TEXT,
            exists_mac_hd BOOLEAN DEFAULT FALSE,
            exists_stash BOOLEAN DEFAULT FALSE,
            mac_display_order INTEGER,
            lora_strength INTEGER,
            created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
            updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )",
        [],
    )?;

    // Create relationships table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ckpt_x_ckpt (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_ckpt_filename TEXT NOT NULL,
            child_ckpt_filename TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
            UNIQUE(parent_ckpt_filename, child_ckpt_filename),
            FOREIGN KEY (parent_ckpt_filename) REFERENCES ckpt_models(filename) ON DELETE CASCADE,
            FOREIGN KEY (child_ckpt_filename) REFERENCES ckpt_models(filename) ON DELETE CASCADE
        )",
        [],
    )?;

    // Migrate data from old schema if tables exist
    let has_old_data: bool = conn
        .query_row(
            "SELECT COUNT(*) > 0 FROM sqlite_master WHERE type='table' AND name='models'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if has_old_data {
        println!("Migrating existing data from old schema...");

        // Migrate models data
        conn.execute(
            "INSERT INTO ckpt_models (
                filename, display_name, model_type, file_size, checksum, source_path,
                exists_mac_hd, exists_stash, mac_display_order, lora_strength, created_at, updated_at
            )
            SELECT 
                m.filename,
                COALESCE(mac.custom_name, m.display_name) as display_name,
                m.model_type,
                m.file_size,
                m.checksum,
                m.source_path,
                CASE WHEN mac.id IS NOT NULL THEN 1 ELSE 0 END as exists_mac_hd,
                CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as exists_stash,
                mac.display_order as mac_display_order,
                CASE WHEN mac.lora_strength IS NOT NULL THEN CAST(mac.lora_strength * 10 AS INTEGER) ELSE NULL END as lora_strength,
                m.created_at,
                m.updated_at
            FROM models m
            LEFT JOIN mac_models mac ON mac.model_id = m.id
            LEFT JOIN stash_models s ON s.model_id = m.id",
            [],
        )?;

        let migrated_count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM ckpt_models",
            [],
            |row| row.get(0),
        )?;
        println!("Migrated {} models to new schema", migrated_count);

        // Drop old tables
        println!("Dropping old tables...");
        conn.execute("DROP TABLE IF EXISTS mac_models", [])?;
        conn.execute("DROP TABLE IF EXISTS stash_models", [])?;
        conn.execute("DROP TABLE IF EXISTS models", [])?;
    }

    conn.execute(
        "UPDATE config SET value = '3' WHERE key = 'schema_version'",
        [],
    )?;

    println!("Migration to v3 complete!");
    Ok(())
}
